# Softworg Engineering Services: Architecture

## Approach
A modular, feature-based Next.js (App Router) application with layered boundaries *inside* each
feature module. Layers exist only where they add value: a content-only module has fewer layers
than a transactional one.

## Structure
- `src/app`: delivery layer. Routing, page composition, server actions, error/not-found.
  The only place that combines modules. No business rules, no data-source code.
- `src/modules/<module>`: business capabilities: `company`, `services`, `projects`, `products`,
  `insights`, `contact`. Each may contain `domain`, `application`, `infrastructure`,
  `presentation`, and a `composition.ts`.
- `src/shared`: genuinely generic code only (UI primitives, config, route constants, tiny utils,
  common value types). It must not import from modules or `app` (lint-enforced).

## Layer responsibilities
| Layer | Contains | May import |
|---|---|---|
| domain | models, lifecycle constants, rules, repository interfaces, validation | `shared/types`, `shared/utils`, other modules' **domain** only where listed in `DOMAIN_IMPORTS` |
| application | use cases, ports (e.g. `EnquiryReceiver`) | own domain, `shared` (non-UI) |
| infrastructure | file-backed repositories for Projects, Products and Insights; seed/in-memory implementations where already used elsewhere | own domain + own application (to implement ports) |
| presentation | module-specific React components; receive data via props | own domain, own application types, `shared/ui`, `shared/constants` |
| composition.ts | picks implementations, builds the module's services | everything in its own module |
| app | pages, actions | any module's `composition`, `presentation`, `domain`; never `infrastructure` |

Dependency direction: `presentation → application → domain ← infrastructure`.
`composition.ts` is the single seam where infrastructure is chosen.

### Enforcement (`eslint.config.mjs`, `no-restricted-imports`)
Verified by planting violations: domain importing React/Next, any layer importing a forbidden layer,
cross-module imports, pages importing infrastructure, shared importing modules, and relative `../`
imports (banned inside modules so boundaries cannot be bypassed) all fail lint. Intended imports pass.
- Imports across folders must use `@/...` absolute paths; `./` sibling imports are fine.
- Test files (`*.test.ts`) are exempt so integration tests may cross layers.
- **Limit:** this enforces *import paths*, not runtime behaviour; it does not detect cycles
  (check with `npx madge --circular --extensions ts,tsx --ts-config tsconfig.json src`).

## Deliberate cross-module dependency
`Project.category` is typed as `CapabilitySlug` from the Services domain. This is intentional: the four
capabilities are the company's shared business taxonomy, and a project is categorised by the
capability it delivers. Duplicating the list would let the two drift apart.
It is the *only* allowed cross-module import and is enforced as such: `DOMAIN_IMPORTS` in
`eslint.config.mjs` permits `projects → services/domain` and nothing else. If the taxonomy ever needs
to vary per module, replace the type in `Project` with a local one and delete the entry.

## Data abstraction
Page → (use case) → repository interface (domain) → implementation (infrastructure).
Today: Projects, Products and Insights use filesystem-backed JSON repositories; other repository
implementations remain feature-specific. Pages depend on domain types and composition roots only.

The Stage 7B3 Prompt 2 editor is a static Decap CMS interface under `public/admin/`. Its Turbo
GitHub backend configuration is external to application composition: CMS writes go through the
provisioned Turbo service to GitHub, while public reads continue through the Stage 7B2 file-backed
repositories. See `docs/content-cms.md` for field mapping, draft behavior, and the unprovisioned
Site ID setup gate.

The repository sources are `content/projects`, `content/products`, and `content/insights` at the
project root. Each entry is one UTF-8 JSON file named `<slug>.json`; its `slug` field must exactly
match the lowercase filename stem. Empty directories yield empty result sets. `.gitkeep` retains
these directories until approved content is authored. No production sample content is included.

Repositories validate every JSON file when a query reads the collection. Invalid JSON, missing or
mistyped fields, invalid enum/date values, and filename/slug mismatches fail the operation with the
file path and field where available; malformed entries are never silently skipped. Valid drafts are
allowed: public query rules remain in the application/domain layer. Projects require PUBLIC visibility
and a non-archived status; Products require PUBLIC visibility and a lifecycle marked publicly listed;
Insights require PUBLISHED status and `publishedAt`. Detail route parameters are generated from those
public queries and unknown parameters are disabled. Test fixtures live in isolated test directories.

For required fields, use the TypeScript domain interfaces in `src/modules/{projects,products,insights}/domain`
as the source of truth. Project records require `id`, `slug`, `title`, `summary`, `description`,
`category`, `status`, `visibility`, `technologies`, `featured`, `images`, `startDate`, `createdAt`,
and `updatedAt`; `category` must be one of the Services capability slugs and image assets require
`src` and `alt`. Product records require `id`, `slug`, `name`, `tagline`, `description`, `status`,
`visibility`, `featured`, `features`, `createdAt`, and `updatedAt`. Insight records require `id`,
`slug`, `title`, `summary`, `body`, `tags`, `status`, and `updatedAt`; published insights also require
`publishedAt`. Optional model fields remain optional. Dates must be valid ISO date or date-time strings.

To add an entry, create a JSON file in the matching directory, choose a lowercase hyphenated filename,
set the same `slug` in the record, and author all required fields using the domain model and enum
constants. Keep draft/unpublished state explicit; only use published status when the content is ready
for the public site. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` before
committing content. Any malformed JSON file fails reads/builds that enumerate that content type.

## Project vs Product
- **Project**: an engineering initiative. One model; `status` (PLANNING…ARCHIVED) maps to a *phase*
  (`ongoing` / `delivered` / `archived`) and `visibility` (PUBLIC/PRIVATE/INTERNAL) controls exposure.
  "Portfolio" and "Ongoing" are *views* of the same entity. Public use cases always force `PUBLIC`.
- **Product**: a reusable offering. It may reference a project by id; it shares no model or code with Projects.

### Product publication rules
Lifecycle and visibility are two separate concepts, defined in separate files:

| Concept | Question it answers | Values | File |
|---|---|---|---|
| Lifecycle (`status`) | Where is the product in its life? | CONCEPT, DEVELOPMENT, BETA, LIVE, MAINTENANCE, RETIRED | `product-lifecycle.ts` |
| Visibility | Who may see it? | PUBLIC, PRIVATE, INTERNAL | `product-visibility.ts` |

A product is eligible for public listing only when **both** allow it (`isPubliclyListed`):
visibility is `PUBLIC` **and** its lifecycle stage is flagged `listedPublicly`.

| Lifecycle | `listedPublicly` | Listed if PUBLIC | Listed if PRIVATE / INTERNAL |
|---|---|---|---|
| CONCEPT | no | no | no |
| DEVELOPMENT, BETA, LIVE, MAINTENANCE | yes | yes | no |
| RETIRED | no | no | no |

- The public use cases (`listPublic`, `getBySlug`) apply this rule, so retired, concept, private and
  internal products are excluded by default and cannot be fetched by slug.
- Which stages are `listedPublicly` is a business assumption held in one place
  (`PRODUCT_STATUS_META`); confirm it before launch. Changing it does not affect visibility.
- `PRODUCT_VISIBILITY` intentionally duplicates the three Project visibility values instead of
  importing them, so Products stays independent of Projects.

## Contact enquiries (Stage 7B1 behavior)
- `FEATURE_CONTACT_FORM` defaults to off. The server action re-checks it on every request, so a
  disabled form cannot be used by calling the action directly. The contact page reads delivery mode
  per request (`force-dynamic`).
- The composition resolves `disabled`, `test`, or `live` delivery per request. Test mode uses
  `LogEnquiryReceiver`, which logs only an id and timestamp and does not persist or send enquiries.
  Live mode uses the configured `ResendEnquiryReceiver` only after its production and configuration
  gates pass; a successful submission means Resend accepted the request, not that it reached an inbox.
- The form uses a honeypot and an HMAC-signed time token. These deter simple automated submissions;
  they are not rate limiting or a challenge. See the Stage 7B1 delivery notes below for the full
  live-mode requirements and unresolved operational decisions.

## V1 scope (historical baseline)
The initial V1 scope covered typed in-memory data, public list pages for the six domains plus
`/projects/[slug]`, a contact use case and flagged form, shared UI primitives, design tokens in
`globals.css`, error/not-found states, lint boundaries, and Vitest. The in-memory content assumption
was superseded in Stage 7B2: Projects, Products and Insights now read JSON files from the project
content directories. The original V1 scope is retained here as project history, not as a description
of the current content sources.

## Still deferred
Database, CMS, auth, admin, CRM, client portal, payments, analytics, `/solutions` and `/industries`,
rich content rendering, additional contact-abuse controls such as rate limiting or a challenge, and
e2e tests. Product and insight detail routes, their metadata, basic honeypot/time-token checks, and a
Resend-backed live enquiry receiver were implemented in later stages.

## Loading states
There is no root `loading.tsx` or route-level loading skeleton currently. Projects, Products and
Insights read local JSON files; their detail routes generate parameters from eligible public queries
and set `dynamicParams = false`, while their pages retain `notFound()` checks. The Contact page is
request-dynamic because delivery mode is resolved per request. If a slower runtime data source is
introduced, consider route-level loading UI and verify that unknown detail slugs still return 404.

## Introducing a database / CMS / API
1. Implement the module's repository interface in `infrastructure/` (e.g. `PrismaProjectRepository`).
2. Change the one line in that module's `composition.ts`.
3. Nothing in `app/`, `presentation/`, `application/` or `domain/` changes. Push filters down in the
   implementation (`ProjectFilter` exists for this). Map external shapes to domain types *inside*
   the adapter. Never leak provider types. Secrets are read server-side only (no `NEXT_PUBLIC_`).

## Adding a module (e.g. Careers)
1. `src/modules/careers/domain` (model + repository interface).
2. An appropriate `infrastructure` repository implementation (seed, in-memory, or file-backed) and
   `composition.ts`.
3. Add `application` only if there are rules to enforce; add `presentation` for module-specific UI.
4. Add the module name to `MODULES` in `eslint.config.mjs`.
5. Add routes in `src/app/careers` and entries in `shared/constants/routes.ts` / `navigation.ts`.
No existing module changes.

## Conventions
- Server Components by default; see "When Client Components are permitted" below.
- Import types with `import type`. Design values come from tokens (`globals.css`); never raw hex or arbitrary values.
- Env access only via `shared/config/env.ts`.

## Visual design system (Stage 2)
Dark-first corporate identity: navy foundation, white content, muted-grey support text, cyan/blue as the
interactive and technology accents, violet/magenta only in gradients and depth. Decoration (grid, glow,
gradient hairlines) is optional by construction: every page reads correctly with it removed.

### Design tokens (`src/app/globals.css`, the only place values are defined)
| Layer | Where | Rule |
|---|---|---|
| Primitives | `:root` (`--brand-navy`, `--brand-cyan`, `--brand-blue`, `--brand-violet`, `--brand-magenta`) | The palette. Not used by components. |
| Semantic | `:root` (`--background`, `--foreground`, `--muted-foreground`, `--surface`, `--surface-elevated`, `--border`, `--border-strong`, `--border-input`, `--primary(-hover/-active/-foreground)`, `--accent`, `--focus`, `--success/warning/error`) | What components consume, via utilities (`bg-surface`, `text-muted-foreground`, `border-border`). |
| Scales | `@theme static` | Type, radius, shadow, breakpoints, content widths. |
| Rhythm | `--section-y`, `--gutter` (responsive in `:root`) | `py-section`, `px-gutter`: components never branch on breakpoint for these. |
| Motion | `--duration-fast/standard/slow`, `--ease-standard` | Utilities `motion-fast` (hover, press), `motion-standard` (cards, panels), `motion-slow` (reserved for emphasis). `prefers-reduced-motion` collapses all transitions globally. |

- **Colour roles:** `primary` (cyan) is the one interactive colour. `accent` (violet) is for emphasis and
  never body text (3.2:1 on navy). Status colours always accompany text or an icon.
- **Radius:** `sm` controls, `md` inputs/buttons, `lg` cards, `pill` badges. **Shadows:** `sm`/`md`/`lg`;
  `shadow-glow` is for a rare featured surface and is unused by default.
- **Spacing:** the Tailwind 4px scale is the scale; use steps, not arbitrary values. Section and gutter
  spacing come from the tokens above.
- **Theming:** components read semantic variables only. A second theme is a block overriding the semantic
  variables (e.g. `[data-theme="light"]`); no component changes. No switcher exists or is planned yet.

### Typography
Inter via `next/font/google` (self-hosted at build, exposed as `--font-inter`, consumed by `--font-sans`).
Chosen for screen legibility, tabular numerals and a neutral technical tone; the logo's geometric wordmark
is the only brand-specific lettering. Scale (utilities `text-*`): `display`, `h1`–`h4`, `body-lg`, `body`,
`body-sm`, `caption`, `label`. Display–`body-lg` are fluid (`clamp`); line-height, tracking and weight are
bundled with each size. Bare `h1`–`h4` get the scale by default, so semantic headings look right unstyled;
choose the *element* for the outline and the *class* only if the visual size must differ.
`next/font/google` needs network access on first build; switch to `next/font/local` for offline CI.

### Components (`src/shared/ui`)
`Button`/`ButtonLink` (primary, secondary, outline, ghost, destructive; sm/md/lg; `buttonVariants()` for
anything button-shaped), `Card`/`CardGrid` (standard, elevated, linked), `Badge` (neutral, primary, success,
warning, error), `Container` (narrow/default/wide), `Section`, `PageHeader` (default/hero), `TextField`,
`EmptyState`, `Logo`, `layout/SiteHeader`, `layout/SiteNav`, `layout/SiteFooter`.
- Components take data via props and never import modules. The footer's capability list is supplied by the
  root layout (app layer) from the Services composition root.
- Use a real `<a>` (`ButtonLink`) to navigate and a `<button>` (`Button`) to act.
- No `className` escape hatch for colours; extend a variant instead of overriding it.
- Logo: `public/brand/softworg-logo.png` and `softworg-mark.png`, keyed from the supplied dark-background
  artwork, used through `Logo`. Replace the files and the two size entries in `logo.tsx` to change artwork.

### Responsive approach
Mobile-first: unprefixed classes are small mobile (~360px). Breakpoints: `xs` 480 (large mobile), `sm` 640,
`md` 768 (tablet), `lg` 1024 (laptop, inline nav), `xl` 1280, `2xl` 1536. Text scales fluidly; gutters and
section spacing step up at `md` and `xl`; content is capped at `max-w-page` (72rem) or `wide` (80rem).
Navigation is a disclosure menu below `lg` and inline from `lg`.

### Accessibility conventions
Semantic landmarks and one `h1` per page (`PageHeader`); skip link in the root layout; a single global
`:focus-visible` ring that components must not remove without an equivalent (linked `Card` draws it on the
card); `aria-current="page"` plus a non-colour cue on the active nav item; form fields get a programmatic
label, `aria-describedby` for helper/error text and `aria-invalid`; errors carry an icon and a screen-reader
prefix; badge meaning is in the text; decoration is `aria-hidden`. Form control borders use `--border-input`
for edge contrast. **This is a set of conventions, not a WCAG conformance claim**; no audit has been run.

### When Client Components are permitted
Only for state, effects, browser APIs or event handlers that cannot run on the server. Today: `SiteNav`
(pathname for active state, menu open state), `ContactForm` (`useActionState`), `error.tsx`/`global-error.tsx`
(required by Next). Keep them as small leaves; pass them serialisable props; never mark a layout, page or
`shared/ui` primitive `"use client"` for convenience.

### How future components consume tokens
1. Use semantic utilities (`bg-surface`, `text-muted-foreground`, `rounded-lg`, `text-h3`, `py-section`).
2. Need a value that does not exist? Add a semantic token in `globals.css` first, then use it.
3. Compose `Container` → `Section` → `Card`/content; start a page with `PageHeader`.
4. Reach for `bg-brand-gradient`, `bg-grid`, `bg-glow` sparingly and always on `aria-hidden` elements.

## Homepage (Stage 3)
`src/app/page.tsx` only composes. Page copy lives in `src/app/_home/content.ts` (a private, non-routed folder)
so it can be reviewed as text; section markup is in `_home/sections.tsx`, the hero schematic in
`_home/hero-visual.tsx`. The four capability cards come from `serviceRepository.findCapabilities()`.
- **Showcase** (`_home/showcase.tsx`) reads only `projectQueries.listOngoing/listPortfolio` and
  `productQueries.listPublic`, so visibility and lifecycle rules stay enforced in the application layer. It
  renders nothing when there is no eligible entry (true today: both sources are empty), never placeholders.
- All copy describes capabilities and intent. It contains no clients, results, statistics or history, and
  all of it is placeholder until approved by the company.
- Metadata: `title.absolute` and description are built from `siteConfig`, plus a canonical of `/`.

## Core pages (Stage 4)
`/about`, `/services`, `/projects`, `/products`, `/insights`, `/contact` are Server Components that compose shared
UI and read data only through composition roots. Page copy sits beside the page (`about/content.ts`,
`services/content.ts`) or in `app/_content/cta.ts` (the shared closing call to action).
- **Services** are data (superseded in Stage 6: six services plus four capabilities, see below). Seeds are
  `Record`s keyed by slug, so a new slug cannot ship without content.
- **Projects / Products / Insights** show only what their queries return (visibility and lifecycle are enforced in the
  application layer) and an intentional `EmptyState` when that is nothing. All three sources are empty today.
- **Contact delivery (Stage 7B1):** `EnquiryReceiver` remains the application port. The infrastructure layer provides
  `ResendEnquiryReceiver` using built-in `fetch`, plain text, visitor `Reply-To`, an eight-second timeout, and an
  idempotency key derived from the enquiry ID. Resend retains idempotency keys for 24 hours and requires the same
  payload for a retry; this is not an application retry queue or guaranteed delivery.
  `composition.ts` resolves delivery per request. Live mode requires the feature flag, explicit `CONTACT_DELIVERY_MODE=live`,
  `NODE_ENV=production`, `CONTACT_DEPLOYMENT_ENV=production`, complete validated Resend settings, a 32-byte signing
  secret, and the operator attestation `CONTACT_SENDER_DOMAIN_VERIFIED=true`. Set the deployment variable only in the
  approved production runtime; never copy it into preview configuration. If `VERCEL_ENV` is available at runtime, it
  must also equal `production`. The sender attestation must be set only after verifying the exact domain/address in
  Resend. An address suffix alone does not establish verification. All other contexts fail closed. The feature flag
  remains false in `.env.example`.
  The public form uses a honeypot and an HMAC-signed time token (minimum three seconds, maximum one hour). These controls
  reduce simple automated submissions but do not replace rate limiting or a challenge. The action logs only a safe
  category and HTTP status; it never logs enquiry content, visitor addresses, API keys, or provider response bodies.
  A successful action means Resend accepted the request, not that a recipient inbox received it. Email-only delivery has
  no application inbox, durable enquiry store, or guaranteed retry capability. The owner must select two recipient
  inboxes, retention policy, production sending domain, and hosting-specific production environment settings before
  enabling live delivery. Do not send real enquiries until sender verification and those settings have been confirmed.
- New shared components, each used on more than one page: `CtaBand`, `ProcessSteps`, `CheckList`, `Notice`;
  `EmptyState` gained a children slot. Module presentation: `ServiceList` (overview/detailed), `ServiceIcon`,
  `ProductList`/`ProductCard`, `InsightList`.
- Metadata: each page sets `title` (template adds the brand), `description` and a canonical path; project detail pages
  derive theirs from the project and resolve to "not found" for non-public projects.

## Detail pages, SEO and hardening (Stage 5)
- **Public detail routes:** `/projects/[slug]`, `/products/[slug]`, `/insights/[slug]`. Each resolves its entity only through
  the public query (`getBySlug`), which applies the same rules as the listings, and calls `notFound()` otherwise. Metadata for
  a non-public entity is a generic noindex "not found" title: private names never reach metadata. `generateStaticParams`
  lists only public entities.
- **Projects:** `isPubliclyListed` (PUBLIC and not archived) now backs `getBySlug`, so an archived project is no longer
  reachable by slug while absent from every listing. `listRelated` returns other public projects in the same category.
  Detail pages render only fields the data has (context/approach/outcome, links, technologies); nothing is filled in.
- **Metadata:** every page builds metadata with `shared/seo/buildMetadata` (title with brand, description, canonical,
  Open Graph, X `summary_large_image`). The preview image is the brand logo on navy (`public/brand/og-image.png`); no screenshots.
  `app/sitemap.ts` and `app/robots.ts` use the public queries; set `SITE_URL` at build time or they advertise localhost.
- **Structured data:** `JsonLd` (payload escaped by `serializeJsonLd`). Organization and WebSite on the homepage (name, logo,
  tagline only) and Article on published insights. Nothing else is asserted.
- **Content links:** `toSafeExternalUrl` allows only http(s); `ExternalLink` opens new tabs with `noopener noreferrer`.
  `ContentImage` renders only site-relative images with known dimensions; remote hosts must be allow-listed first.
- **Headers:** `next.config.ts` sets nosniff, frame denial, referrer and permissions policies. No CSP yet (needs nonces).
- **Not added, deliberately:** loading skeletons, analytics, related-services links for insights and
  products (neither model has a category). The JSON-backed content pages currently need no loading
  skeleton; revisit this if their data source becomes a slower runtime service.

## Configuration and production readiness (Stage 6 decisions; contact delivery updated in Stage 7B1)
This section preserves the Stage 6 configuration and business decisions. Any earlier statement that
the project has no real contact receiver is superseded by the Stage 7B1 delivery implementation below.
**Public business facts live in one file:** `src/shared/config/site.ts` (`siteConfig`): company name, business
nature, positioning, public email, phone, location, full address and social links. The Company module adapts it
to its domain contract (`SeedCompanyRepository`), so pages read it through `companyRepository`; shared code
(metadata, logo alt text, footer) reads `siteConfig` directly. Nothing else may write these facts:
`src/governance.test.ts` fails if the email, phone, address or any social URL appears in another source file, if the
full address is read outside the Contact page, or if placeholder content (`.example`, `example.com`, lorem ipsum) returns.
- **Address policy:** the full address is shown on the Contact page only. It is not in metadata or structured data.
- **Social accounts:** each carries a `kind`. LinkedIn and Instagram are `official`; the X account is
  `representative` (founder/representative) and is shown only on the Contact page, labelled as such. The footer lists
  official accounts only.
- **Capabilities vs services:** four core capabilities (`Capability`, used for the homepage/About cards and
  `Project.category`) are distinct from the six approved top-level services (`Service`, the Services page and
  footer). "Digital Solutions" is the overarching theme, not a service, and Product Engineering is a capability that
  appears under Custom Software Engineering. Do not add a service without approval.
- **Public vs private configuration:** public values are in `siteConfig` and may be rendered. Private values
  (credentials) are read only by server-side code via environment variables and never use `NEXT_PUBLIC_*`. `.env*` is
  git-ignored except `.env.example`, which holds no real values.
- **Environment (`shared/config/env.ts`):** `SITE_URL` (optional, validated, origin only) and
  `FEATURE_CONTACT_FORM` (exact string `true`). Outside production `SITE_URL` defaults to `http://localhost:3000`;
  **in production it has no default**. With no `SITE_URL`, canonical URLs, Open Graph URLs/images, the sitemap
  (empty), the robots sitemap line, `metadataBase` and structured-data URLs are omitted rather than guessed, and
  appear everywhere once the variable is set at build time. Error messages never echo configuration values.

### Contact receiver states (current Stage 7B1 behavior)
`resolveContactMode` (contact domain) names the state the UI must describe. The Stage 7B1 composition
resolver selects live mode only after all production gates pass:
| Mode | Condition | Behaviour |
|---|---|---|
| `disabled` | `FEATURE_CONTACT_FORM` not `true` | Form hidden; server action refuses; page shows email/phone. |
| `test` | flag on, explicit test mode, non-production context | Validated, only id + timestamp logged, nothing delivered; page says so. |
| `live` | flag on, explicit live mode, approved production context, complete validated configuration | Resend accepts notification request; no inbox receipt or reply time is promised. |
| `disabled` | feature off or any live/test safety prerequisite missing | Form hidden and action refuses submissions; page offers company contact details. |

### Unresolved configuration (needs a human decision)
Production domain (`SITE_URL`); company-domain email (currently a temporary public Gmail address); two notification
recipients; retention policy; verified production sending domain; production-only `CONTACT_DEPLOYMENT_ENV`; approved
public projects; approved public products; approved wording for all page copy.

## Testing
- Vitest, colocated `*.test.ts` (`npm test`). Use cases take dependencies as arguments, so tests use fakes.
- Component tests: add jsdom + Testing Library when UI complexity warrants. E2E: Playwright in `e2e/` later.
