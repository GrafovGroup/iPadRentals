# iPadRentals.ca

Bilingual iPad rental website powered by I Love Events. Existing private Sites identity is preserved in `.openai/hosting.json`. No domain or audience change.

## Development

`pnpm install`, `pnpm build`, `pnpm test`. `node scripts/preview.mjs` starts a local Worker-compatible preview on port 8765 with a fresh local database. Test submissions use example.invalid addresses and never reach the hosted database or an email recipient.

`content.mjs`, `expanded-content.mjs` and `more-cities.mjs` contain bilingual editorial content. `config.mjs` owns business contact details, route migration, analytics identifiers, hidden future content and locale-specific SEO overrides. `enhanced-site.mjs` supplies shared form and editorial components. `build.mjs` generates 128 pages per language. `scripts/build-worker.mjs` bundles a Cloudflare-compatible Worker, pages and optimised assets.

## Enquiries

POST `/api/enquiries` validates and saves requests in D1. The public site has no endpoint for reading leads. Site-owner database access is provided by Sites. Controls include exact-origin validation, JSON-only requests, honeypot, timing check, bounded inputs, prepared SQL, rate limiting, unique idempotency keys and retry-safe saves. Request failures preserve the browser input. Only a successful persistence response shows receipt confirmation. No production enquiry was submitted during validation.

Optional notifications use server-only `LEAD_WEBHOOK_URL` and `LEAD_WEBHOOK_SECRET`. Configure an authorised HTTPS provider adapter through Sites runtime secrets. Requests carry an idempotency key. Failed notification attempts remain marked in the database and do not remove a valid enquiry. No recipient or delivery provider is invented. Inspect `notification_status` for unconfigured/failed records before configuring or retrying delivery.

The full form includes contact, company, dates, location, quantity, connectivity, accessories, configuration and delivery. Quick forms capture the essentials. No credentials should ever be submitted.

## Database

`db/schema.ts` is the source schema; generated `drizzle/` migrations are deployed by Sites. Applied migrations are immutable. Generate additional schema changes with `pnpm db:generate`; review SQL before deployment. Data export/deletion and retention decisions belong to the business; no invented retention period is stated.

## Analytics and attribution

GA4, GTM and Search Console IDs are null by default. When configured, analytics load only after opt-in. Events contain event names, locale and path, never form content. Session storage keeps sanitised campaign attribution and a non-sensitive confirmation reference. No contact-data draft is persisted. Configure a GTM container so it respects consent and does not capture form data.

## SEO and editorial scope

Canonical English and French routes use the current Sites origin. Old URLs redirect permanently to the new topic or province/city route. Sitemap excludes the noindex thank-you page. BreadcrumbList and Service schema supplement Organization/WebSite information. No fake addresses, offices, reviews, prices or inventory claims. All 37 priority city pages have distinct editorial planning angles, province context and related links. No automatic city/service combinations are published.

Case-study, social-proof and pricing data structures are prepared but inactive until verified business content is provided. Legal copy describes the implementation and defers rental conditions to the agreement. Business/legal review remains an internal follow-up; it is not displayed as launch-status language.

## Images

The original tablet product photograph is by François Hoang on Unsplash: https://unsplash.com/photos/black-ipad-and-white-apple-pencil-on-gray-table-15LQr2QttqU (https://unsplash.com/license).

Eight additional deployment and equipment illustrations were generated for the subject matter, with no real client or completed-project claims. Prompts are recorded in `image-provenance.json`. Responsive WebP sizes have descriptive EN/FR alt text and explicit dimensions. No customer-facing provenance disclaimer is used.

## Validation

Worker tests verify durable storage, duplicate suppression, conflict detection, full/quick validation, cross-origin rejection, honeypot rejection, rate limiting, redirect behaviour and absence of public lead-reading routes. Static checks verify route links, assets, metadata, self-canonicals, alternate locales and one H1 per page. Browser checks cover phone/tablet/desktop layouts, bilingual full forms, quick forms and retry behaviour. Tests use only the local database.

## Version 3 refinements
The enquiry address is info@ipadrentals.ca. Confirmed inventory is standard iPad 9th generation and newer; exact generations, storage and mini/Air/Pro availability remain quote-specific.

`refinement-content.mjs` and `scripts/refine-site.mjs` shorten the homepage, provide a comparison and four detailed workflow guides, remove repeated promotional prose, and assign 33 distinct images to topics. English/French equivalents share the corresponding image. Navigation, contact information and functional form labels intentionally remain consistent. City pages are indexable and included in the sitemap. Province detail pages remain noindex,follow and omitted from the sitemap.

The owner dashboard is `/manage/`. It requires the platform's authenticated user ID and verified email matching server-only ADMIN_OWNER_EMAIL. It supports lead status, private notes, pagination, delivery status and failed notification retries. LEAD_NOTIFICATION_EMAIL is info@ipadrentals.ca; an authorized HTTPS LEAD_WEBHOOK_URL adapter is still required to send notifications. Saving an enquiry works independently of email. There is no configured email delivery service. No production enquiry was submitted in testing.

First-party analytics are opt-in and aggregate counts by day, path, language and allowed event, with no contact details or visitor identifier. GA4/GTM remain unconfigured. The owner dashboard combines consented funnel counts with saved enquiry statuses. Every migration in drizzle is applied to local preview/testing.

Image provenance is internal in v3-image-provenance.json; visuals do not substantiate customer or completed-project claims. Real client evidence, verified specifications and locality details still require business-supplied information.
