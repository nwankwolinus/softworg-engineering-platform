# Content CMS

The browser editor is served from `/admin/` by `public/admin/`. It loads Decap CMS **3.17.0-beta.0**, which includes the `turbo-github` backend. The exact version is pinned in `public/admin/index.html`; Turbo’s published setup guide specifically documents this beta version. Beta APIs and CDN availability remain operational risks.

## What is verified here

`public/admin/config.yml` selects `backend: turbo-github` and `publish_mode: editorial_workflow`. Decap documents this option, and Turbo documents that its GitHub backend extends the standard GitHub backend. The published `decap-cms-backend-turbo-github` package documentation says inherited GitHub functionality includes branching and PR-based editorial workflow. Accordingly, the configured combination is supported by the documented backend design.

The expected workflow is:

1. Saving a new editorial draft creates/updates a `cms/<collection>/<slug>` branch and a pull request against the Turbo site’s configured publication branch. Later saves update that draft branch/PR.
2. Review the PR diff and checks in GitHub. The editor can make further changes to the same draft. Use Decap’s Publish action after review; the standard editorial workflow merges the PR and removes its draft branch. The merged files then reach the configured production branch and are eligible for the host’s normal build/deploy process.
3. Possible ways to abandon a draft are deleting it in Decap or closing its PR. Whether either action is available and correctly cleans up the other resource with this Turbo setup has not been verified against a live site. Confirm the final branch/PR state in GitHub before considering an abandoned draft cleared.

These are documented capabilities, not end-to-end test results for this installation. The `turbo_site_id` remains `REPLACE_WITH_TURBO_SITE_ID`; the checkout also has no verified Git remote, Turbo site, configured publication branch, or hosting integration. Therefore authentication, actual branch and PR creation/update/merge/delete behavior, permissions, build status, and production publishing are **unverified for this site**. The Turbo dashboard is authoritative for repository and branch. Do not infer live operation from this config alone.

## Editorial state and public content rules

CMS draft/publish state controls where a change is committed during editorial workflow. It does not set application publication fields. In particular, an editorial draft branch may contain JSON whose domain fields still say public or published; that branch is not the production branch unless the hosting setup separately deploys it. Do not point production at editorial branches. The public application reads only the production checkout’s files and applies its domain rules:

| Content | JSON fields that make an entry eligible for public routes/listings |
| --- | --- |
| Project | `visibility: PUBLIC` and any valid status except `ARCHIVED` |
| Product | `visibility: PUBLIC` and status `DEVELOPMENT`, `BETA`, `LIVE`, or `MAINTENANCE` |
| Insight | `status: PUBLISHED` and a valid `publishedAt` |

Projects and products have no CMS editorial status field: their `status` is lifecycle, and `visibility` is audience access. Insights have a domain `status` (`DRAFT` or `PUBLISHED`) in addition to Decap’s editorial state. An editorial draft does not automatically turn an insight’s JSON status into `DRAFT`. To keep content private after an editorial change reaches production, explicitly set project/product visibility to `PRIVATE` or `INTERNAL`, set a project status to `ARCHIVED`, set a product to an ineligible lifecycle status, or set an insight to `DRAFT` (and remove `publishedAt` if it should no longer carry a publication date).

The file repositories validate every JSON file before queries use it. Required blanks, blank optional strings that are present, malformed or invalid dates, unsupported enum values, and a slug that differs from its `.json` filename stem fail repository reads/builds. Optional fields must be omitted when unused; `optional-fields.js` is intended to omit blank values. An insight marked `PUBLISHED` without a valid `publishedAt` is rejected. The CMS does not conditionally require that date, so this validation remains authoritative. Do not merge a change whose content validation/build fails.

Publishing an edit to an already public entry keeps it public if its domain fields remain eligible. Unpublishing is a domain-data edit plus the editorial merge: set the appropriate non-public status/visibility as above and publish that reviewed change. Decap editorial state alone does not unpublish it. These JSON outcomes follow from the repository validators and query filters; Turbo’s live serialization and merge behavior are not tested here.

Archived projects and inactive/retired products remain valid JSON when their status is a recognized enum; they are excluded from public queries. A changed slug must be saved under the same slug filename stem. Decap’s folder collection uses `slug: "{{fields.slug}}"`, but the effect of changing an existing entry’s slug on the old file is not verified here. Review the PR to ensure the old JSON file is removed/renamed and the new file matches its slug; otherwise the repository can reject the content or stale routes can persist. Deleting an entry through a reviewed and merged file deletion removes it from the next build’s generated routes. Exact CMS deletion behavior on Turbo remains unverified. Review deletions and slug changes carefully; use redirects separately if old public URLs need to continue working.

## Preview limits

There is no authenticated Next.js draft preview in this project. Public pages, metadata, sitemaps, and static route parameters use the repository-backed, domain-filtered queries; no route exposes an arbitrary draft branch. A local Next.js run reads the local checkout’s files, not the Turbo branch automatically. A production-site preview depends on the hosting provider’s branch preview configuration and is not established by this repository. Decap’s editor preview (field rendering), a local app preview, and a host-generated deployment preview are different things; none is verified as available here. Do not expose draft files through a public route to compensate.

## Collections and local checks

The three collections write one JSON file per entry to the existing `content/projects/`, `content/products/`, and `content/insights/` folders. Their fields and enums mirror the domain models; stable IDs and authored dates are entered explicitly. Current image controls edit image metadata only and do not upload media. Slugs use lowercase ASCII letters, digits, and single hyphens, and are the filename stems.

Run `npm run check:cms-config` to parse the YAML and check paths, fields, enums, and the pinned version. It accepts either the explicit `REPLACE_WITH_TURBO_SITE_ID` placeholder or a UUID-shaped value copied from the provisioned Turbo site's Overview; this shape check does not establish that the ID is real or that login works. After provisioning, replace only the placeholder with that site's actual UUID, then run the checker again. Do not add guessed repository or branch values. `npm run dev` serves the static interface at `http://localhost:3000/admin/`; `/admin/config.yml` serves its config. With the placeholder site ID, do not attempt login or save content. Before real use, an owner must provision/configure the Turbo site, connect the intended repository and publication branch, register the actual admin URL, set the real site UUID, and verify access and deployment behavior. Then use a non-production test entry/branch to verify login, draft save/update, PR review/publish, unpublish, abandonment, and host preview. Those external setup and authenticated verification steps are not performed by this task.

## References

- [Turbo: Connecting a site](https://decapcms.org/docs/turbo-connecting-a-site/) — beta version pin, site ID, branch and repository configuration.
- [Turbo: How it works](https://decapcms.org/docs/turbo-how-it-works/) — saves as commits on the configured Git branch.
- [Turbo GitHub backend package](https://www.npmjs.com/package/decap-cms-backend-turbo-github) — backend inheritance and delegated GitHub backend behavior.
- [Decap: Editorial workflows](https://decapcms.org/docs/editorial-workflows/) — draft branches, PRs, updates, and publish/merge behavior.
- [Decap: Configuration options](https://decapcms.org/docs/configuration-options/) — `publish_mode` and Turbo-specific configuration options.
