import fs from 'node:fs';import {load} from 'cheerio';import {homepage,comparison,flagshipSection} from '../refinement-content.mjs';import {business} from '../config.mjs';
const routes=JSON.parse(fs.readFileSync('routes.json'));const originals={};
const assignments={
'':['event','Tablet stations at a conference welcome desk','Postes sur tablette à un comptoir d’accueil de congrès'],
'ipad-rentals':['v3/comparison','Three tablet sizes arranged side by side','Trois tailles de tablettes côte à côte'],
'standard-ipad-rentals':['v3/standard-tablet','Tablet in a protective case on a desk','Tablette dans un étui sur un bureau'],
'ipad-mini-rentals':['v3/compact-tablet','Compact tablet held in one hand','Tablette compacte tenue dans une main'],
'ipad-air-rentals':['v3/creative-tablet','Tablet and stylus beside design drawings','Tablette et stylet à côté de dessins de conception'],
'ipad-pro-rentals':['v3/premium-tablet','Large tablet paired with a keyboard','Grande tablette avec clavier'],
'cellular-ipad-rentals':['device','iPad and stylus on a stone surface','iPad et stylet sur une surface de pierre'],
'bulk-ipad-rentals':['v3/bulk','Rows of tablets organised for a group deployment','Rangées de tablettes organisées pour un déploiement'],
'solutions/conference-ipad-rentals':['v3/conference','Conference assistance desk equipped with tablets','Comptoir d’assistance de congrès équipé de tablettes'],
'solutions/event-check-in-ipad-rentals':['v3/registration-kit','Tablet, stand and badge printer arranged together','Tablette, support et imprimante à cocardes regroupés'],
'solutions/registration-ipad-rentals':['peripherals','Printer and scanner at a registration workstation','Imprimante et lecteur à un poste d’inscription'],
'solutions/trade-show-ipad-rentals':['trade','Tablet on an exhibition counter','Tablette sur un comptoir d’exposition'],
'solutions/ticket-scanning-ipad-rentals':['v3/ticket-scanning','Staff checking a mobile ticket with a tablet','Personnel vérifiant un billet mobile avec une tablette'],
'solutions/survey-ipad-rentals':['v3/survey','Interviewer offering a tablet to a participant','Personne proposant une tablette à un participant'],
'solutions/training-ipad-rentals':['training','Tablets prepared on training-room tables','Tablettes préparées sur les tables d’une salle de formation'],
'solutions/corporate-ipad-rentals':['v3/corporate','Business team using tablets around a meeting table','Équipe utilisant des tablettes autour d’une table de réunion'],
'solutions/temporary-office-ipad-rentals':['v3/temporary-office','Temporary desks with tablets and keyboards','Bureaux temporaires avec tablettes et claviers'],
'solutions/kiosk-ipad-rentals':['kiosk','Freestanding tablet kiosk in a bright lobby','Borne sur tablette dans un hall lumineux'],
'solutions/field-service-ipad-rentals':['field','Worker consulting a tablet outdoors','Personne consultant une tablette sur le terrain'],
'solutions/data-collection-ipad-rentals':['v3/data-collection','Researcher recording observations on a tablet','Personne consignant ses observations sur une tablette'],
'solutions/festival-ipad-rentals':['v3/festival','Sheltered tablet stations at an outdoor entrance','Postes sur tablette abrités à une entrée extérieure'],
'solutions/sporting-event-ipad-rentals':['v3/sports','Tablet registration at a running event','Inscription sur tablette lors d’une course'],
'solutions/product-launch-ipad-rentals':['v3/product-launch','Interactive tablet at a product demonstration counter','Tablette interactive à un comptoir de démonstration'],
'solutions/education-ipad-rentals':['v3/education','Adult learners using tablets in a classroom','Adultes utilisant des tablettes en classe'],
'solutions/film-production-ipad-rentals':['v3/film','Production crew reviewing a tablet beside film equipment','Équipe consultant une tablette près de matériel de tournage'],
'rental-kits/trade-show':['v3/trade-kit','Secured counter tablet with a mobile hotspot','Tablette sécurisée sur comptoir avec point d’accès mobile'],
'rental-kits/survey':['v3/survey-kit','Protected tablet and charger on a side table','Tablette protégée et chargeur sur une table'],
'rental-kits/training':['v3/training-kit','Tablet transport case with charging supplies','Mallette de tablettes avec accessoires de recharge'],
'rental-kits/kiosk':['v3/kiosk-kit','Tablet enclosure, stand base and cable','Boîtier de tablette, base de support et câble'],
'rental-kits/field-team':['v3/field-kit','Protected tablet, power bank and carrying case','Tablette protégée, batterie externe et mallette'],
'configuration':['v3/preparation','Technician inspecting tablets in a preparation room','Technicien vérifiant des tablettes dans un espace de préparation'],
'industries/research':['survey','Participant completing a tablet form','Participant remplissant un formulaire sur tablette'],
 'technology-rentals':['computing','Laptop, phone and tablet on a clean work surface','Portable, téléphone et tablette sur une surface de travail']};
const normal=s=>s.replace(/\s+/g,' ').trim();
for(const route of routes){const file='dist'+route.path+'index.html',fr=route.lang==='fr',topic=route.path.replace(/^\/fr\//,'/').replace(/^\/|\/$/g,'');const $=load(fs.readFileSync(file,'utf8'));const main=$('main');if(topic==='')main.html(homepage(fr));if(topic==='ipad-rentals')main.html(comparison(fr));
// Remove duplicated promotional and boilerplate elements; preserve standard navigation and form UI.
main.find('.cta-band,.quote-card,.hero-note,.image-pair,.page-image').remove();main.find('picture,img').remove();main.find('.hero-image').remove();main.find('.detail-grid').addClass('editorial-detail');main.find('.related').remove();

main.find('section').each((_,n)=>{if(normal($(n).text())===''&&!$(n).find('form,.unique-hero-slot').length)$(n).remove()});
if(topic==='standard-ipad-rentals'){main.find('.page-head .lead').text(fr?'La gamme standard comprend des iPads de 9e génération et plus récents. Votre application et vos dates orientent le modèle exact.':'The standard range includes iPad 9th generation and newer. Your application and dates guide the exact model.');}
if(topic==='privacy')main.append(`<section class="container section"><h2>${fr?'Mesure avec votre consentement':'Measurement with your consent'}</h2><p>${fr?'Si vous acceptez les statistiques, nous comptons les interactions et les étapes du formulaire par jour, page et langue. Ces compteurs ne contiennent ni coordonnées ni identifiant de visiteur. Votre choix est conservé pour la session. Les demandes enregistrées et leur suivi sont accessibles au propriétaire autorisé.':'If you accept analytics, we count interactions and form steps by day, page and language. These counters contain no contact details or visitor identifier. Your choice is kept for the session. Saved enquiries and follow-up records are accessible to the authorised owner.'}</p></section>`);
const key=topic.split('/').at(-1);main.append(flagshipSection(key,fr));
if(assignments[topic]){const [asset,en,ft]=assignments[topic];const tall=asset==='device';const markup=`<figure class="page-original"><picture><img src="/assets/${asset}-1200.webp" srcset="/assets/${asset}-640.webp 640w, /assets/${asset}-1200.webp 1200w" sizes="(max-width:700px) calc(100vw - 40px), 1100px" width="1200" height="${tall?'1825':'800'}" alt="${fr?ft:en}" fetchpriority="high" decoding="async"></picture></figure>`;if(main.find('.unique-hero-slot').length)main.find('.unique-hero-slot').first().html(markup);else if(main.find('.page-head').length)main.find('.page-head').first().after(`<div class="container single-image">${markup}</div>`);else main.prepend(`<div class="container single-image">${markup}</div>`);}
// Use the page's relevant image for social sharing; keep its URL absolute.
if(assignments[topic]){const image=business.origin+'/assets/'+assignments[topic][0]+'-1200.webp';$('head').append(`<meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image">`)}
if(topic==='faq'){const questions=main.find('details').toArray().map(n=>({'@type':'Question',name:normal($(n).find('summary').text()),acceptedAnswer:{'@type':'Answer',text:normal($(n).find('p').text())}})).filter(q=>q.name&&q.acceptedAnswer.text);if(questions.length)$('head').append(`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:questions}).replace(/</g,'\\u003c')}</script>`)}
// City pages remain indexable; retain the existing province-only indexing setting.
if(/^locations\/[^/]+$/.test(topic))$('meta[name="robots"]').attr('content','noindex,follow');
if(business.email){if(topic==='contact')main.find('.contact-grid article').first().append(`<p><a class="contact-email" href="mailto:${business.email}">${business.email}</a></p>`);$('footer .expanded-footer>div').first().append(`<a href="mailto:${business.email}" class="footer-email">${business.email}</a>`)}
// Keep disclosures on the canonical policy/process pages, not repeated throughout every page.
main.find('p,li').each((_,n)=>{if($(n).closest('form,nav').length)return;const txt=normal($(n).text());if(/^(Device models, quantities|Les modèles, quantités|Your quote should identify|Votre soumission doit préciser|Provide the complete postal|Fournissez le code postal complet|Exact equipment, compatible|Équipement exact, accessoires|Share your dates, location|Précisez vos dates, le lieu|Your address, schedule|L’adresse, le calendrier|Delivery options, costs|Les options, coûts)/.test(txt))$(n).remove()});
originals[route.path]={$,file,fr,topic};}
// Retain a sentence only on its canonical topic page; index cards remain navigational labels.
const ordered=Object.entries(originals).sort(([,a],[,b])=>(a.topic==='faq'?-1:a.topic==='terms'?-1:0)-(b.topic==='faq'?-1:b.topic==='terms'?-1:0));
for(const [path,entry]of ordered){const {$,file,fr,topic}=entry;const set=new Set();$('main p, main li, main h2, main h3').each((_,node)=>{const item=$(node);if(item.closest('form,nav,.progress,.quick-section').length||item.find('a,input,select,button').length)return;const text=normal(item.text());if(text.length<45)return;const key=text.toLowerCase();if(set.has(key))item.remove();else set.add(key)});
$('main .callout').each((_,node)=>{if(!$(node).find('p,li').length)$(node).remove()});
$('main ul,main .faq-list').each((_,node)=>{if(!normal($(node).text()))$(node).remove()});
const genericHeadings=new Set(['Rental questions','Questions de location','Before you choose','Avant de choisir','Confirm the whole setup','Confirmez toute la configuration','Delivery is planned by address','La livraison se planifie par adresse','Design the workflow first.','Planifiez d’abord le fonctionnement.','Choose by workflow.','Choisissez selon l’utilisation.','Before the first device is used','Avant la première utilisation']);
$('main h2,main h3').each((_,node)=>{if(genericHeadings.has(normal($(node).text())))$(node).remove()});
$('main section').each((_,node)=>{if(!normal($(node).text())&&!$(node).find('img,form').length)$(node).remove()});

fs.writeFileSync(file,$.html());}
const indexable=routes.filter(r=>!/^locations\/[^/]+$/.test(originals[r.path].topic)&&!r.path.includes('thank-you'));fs.writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+indexable.map(r=>`<url><loc>${business.origin}${r.path}</loc></url>`).join('')+'</urlset>');
fs.writeFileSync('image-assignments.json',JSON.stringify(assignments,null,2));console.log(`Refined ${routes.length} routes, ${Object.keys(assignments).length} unique topic images, ${indexable.length} sitemap entries`);
