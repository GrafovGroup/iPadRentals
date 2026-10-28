async function readLimited(request){const reader=request.body?.getReader();if(!reader)return '';const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw new Error('too_large')}chunks.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}return new TextDecoder().decode(bytes)}
const MAX_BYTES=18000,BASE='https://ipadrentals-ca.dimagrafov.chatgpt.site';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(b=>b.toString(16).padStart(2,'0')).join('');
const clean=(v,max=300)=>typeof v==='string'?v.trim().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').slice(0,max):'';
const isDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
export function validateLead(input,now=new Date()){
 if(!input||typeof input!=='object'||Array.isArray(input))return {errors:{form:'invalid'}};
 const p={};for(const [k,max]of Object.entries({name:120,company:160,email:254,phone:50,city:100,province:60,postal:7,start:10,end:10,device:60,network:60,configuration:40,delivery:60,apps:500,notes:2500,use:100,technician:40,contact:254}))p[k]=clean(input[k],max);
 p.kind=input.kind==='quick'?'quick':'full';p.locale=input.locale==='fr'?'fr':'en';p.quantity=Number(input.quantity);p.accessories=Array.isArray(input.accessories)?input.accessories.filter(x=>typeof x==='string').slice(0,12).map(x=>clean(x,60)):[];
 const errors={};const today=new Date(now.getTime()-12*60*60*1000).toISOString().slice(0,10);
 if(!p.city)errors.city='required';if(!isDate(p.start)||p.start<today)errors.start='date';if(!isDate(p.end)||p.end<p.start)errors.end='date';if(!Number.isInteger(p.quantity)||p.quantity<1||p.quantity>10000)errors.quantity='quantity';
 const email=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),phone=v=>{const n=v.replace(/\D/g,'');return n.length>=7&&n.length<=18};
 if(p.kind==='quick'){if(email(p.contact))p.email=p.contact;else if(phone(p.contact))p.phone=p.contact;else errors.contact='contact'}else{
 for(const key of ['name','company','province','postal','device','network','configuration','delivery'])if(!p[key])errors[key]='required';
 if(!email(p.email))errors.email='email';if(!phone(p.phone))errors.phone='phone';
 if(!/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTVWXYZ][ -]?\d[ABCEGHJ-NPRSTVWXYZ]\d$/i.test(p.postal))errors.postal='postal';
 }
 p.attribution={};if(input.attribution&&typeof input.attribution==='object')for(const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','landing_page','referrer','source_page']){const v=clean(input.attribution[key],300);if(v&&!/[@]|(?:\d[\s().+-]*){9}/.test(v))p.attribution[key]=v;}
 if(input.consent!==true)errors.consent='consent';p.consent=true;
 if(clean(input.website))errors.form='spam';
 if(!Number.isFinite(input.startedAt)||Date.now()-input.startedAt<1500||Date.now()-input.startedAt>24*3600000)errors.form='timing';
 return {payload:p,errors};
}
export async function handleLead(request,env,ctx){
 if(request.method!=='POST')return json({error:'method'},405);
 const origin=request.headers.get('Origin');const allowed=[BASE,'https://ipadrentals.ca','https://www.ipadrentals.ca',env.PUBLIC_ORIGIN].filter(Boolean);if(env.LOCAL_TEST==='1')allowed.push('http://localhost:8765','http://127.0.0.1:8765');
 if(!origin||!allowed.includes(origin)||request.headers.get('Sec-Fetch-Site')==='cross-site')return json({error:'origin'},403);
 if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'content_type'},415);
 if(Number(request.headers.get('Content-Length'))>MAX_BYTES)return json({error:'too_large'},413);
 let input;try{const text=await readLimited(request);input=JSON.parse(text)}catch(e){return e.message==='too_large'?json({error:'too_large'},413):json({error:'invalid_json'},400)}
 const requestKey=request.headers.get('Idempotency-Key');if(!/^[a-f0-9-]{36}$/.test(requestKey||''))return json({error:'request_key'},400);
 const {payload,errors}=validateLead(input);if(Object.keys(errors).length)return json({error:'validation',fields:errors},422);
 if(!env.DB)return json({error:'unavailable'},503);
 try{
  const serialized=JSON.stringify(payload),payloadHash=await digest(serialized);
  const existing=await env.DB.prepare('SELECT id, payload_hash FROM enquiries WHERE request_key = ?').bind(requestKey).first();
  if(existing)return existing.payload_hash===payloadHash?json({ok:true,reference:existing.id,duplicate:true}):json({error:'conflict'},409);
  const now=Date.now(),window=Math.floor(now/3600000),ip=request.headers.get('CF-Connecting-IP')||'unknown',key=await digest(`${ip}:${window}`);
  const limiter=await env.DB.prepare('INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count').bind(key,now+7200000).first();
  if(limiter.count>8)return json({error:'rate_limit'},429);
  const id='IPR-'+crypto.randomUUID().slice(0,8).toUpperCase();
  await env.DB.prepare('INSERT INTO enquiries (id, request_key, payload_hash, created_at, kind, locale, name, company, email, phone, payload, notification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(request_key) DO NOTHING').bind(id,requestKey,payloadHash,now,payload.kind,payload.locale,payload.name,payload.company,payload.email,payload.phone,serialized,env.LEAD_WEBHOOK_URL?'pending':'unconfigured').run();
  const saved=await env.DB.prepare('SELECT id, payload_hash FROM enquiries WHERE request_key = ?').bind(requestKey).first();
  if(saved.payload_hash!==payloadHash)return json({error:'conflict'},409);
  if(saved.id===id&&env.LEAD_WEBHOOK_URL)ctx.waitUntil(notify(env,id,payload));
  ctx.waitUntil(env.DB.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now).run().catch(()=>{}));
  return json({ok:true,reference:saved.id},201);
 }catch(e){console.error('Enquiry persistence failed',e?.name||'Error');return json({error:'unavailable'},503)}
}
// Formspree accepts a standard URL-encoded form. Keep contact fields separate for reply-to.
export function formspreeFields(id,payload){
 const fields={_subject:`iPadRentals.ca ${payload.kind==='quick'?'quick quote':'rental request'} ${id}`,reference:id,form_type:payload.kind,language:payload.locale};
 for(const key of ['name','company','email','phone','city','province','postal','start','end','quantity','device','network','configuration','delivery','apps','notes','use','technician']){
  const value=payload[key];if(value!==undefined&&value!==null&&String(value).trim())fields[key]=String(value);
 }
 if(payload.accessories?.length)fields.accessories=payload.accessories.join(', ');
 for(const [key,value] of Object.entries(payload.attribution||{}))if(value)fields['attribution_'+key]=value;
 return fields;
}
export async function notify(env,id,payload){
 const lock=await env.DB.prepare("UPDATE enquiries SET notification_status='sending', notification_attempts=notification_attempts+1, notification_last_attempt=? WHERE id=? AND (notification_status NOT IN ('delivered','sending') OR (notification_status='sending' AND notification_last_attempt < ?))").bind(Date.now(),id,Date.now()-300000).run();
 if(!lock.meta.changes)return;
 let status='failed';
 try{
  const u=new URL(env.LEAD_WEBHOOK_URL);if(u.protocol!=='https:')throw new Error('Invalid destination');
  const isFormspree=u.hostname==='formspree.io'&&u.pathname.startsWith('/f/');
  const headers=isFormspree?{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json','Origin':'https://ipadrentals.ca'}:{'Content-Type':'application/json','Idempotency-Key':id,...(env.LEAD_WEBHOOK_SECRET?{'Authorization':'Bearer '+env.LEAD_WEBHOOK_SECRET}:{})};
  const body=isFormspree?new URLSearchParams(formspreeFields(id,payload)).toString():JSON.stringify({reference:id,notificationTo:env.LEAD_NOTIFICATION_EMAIL||null,...payload});
  const response=await fetch(u,{method:'POST',headers,body,signal:AbortSignal.timeout(10000),redirect:'error'});
  // A successful response confirms provider acceptance, not inbox delivery.
  status=response.ok?'delivered':'failed';
 }catch{console.error('Enquiry notification failed; stored enquiry retained')}
 await env.DB.prepare('UPDATE enquiries SET notification_status = ? WHERE id = ?').bind(status,id).run();
}
