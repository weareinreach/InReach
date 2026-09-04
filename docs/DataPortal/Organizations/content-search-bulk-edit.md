# Content Search & Bulk Edit

> **Status: Proposed.** This doc captures a design discussion, not shipped code — every path,
> component, and procedure named below describes a proposal, not an existing file, unless explicitly
> marked "existing." Originally scoped as an unstarted backlog item in
> [`docs/DataPortal/2026-Redesign/organization.md`](../2026-Redesign/organization.md#content-search--bulk-edit).
> Nothing here has permission sign-off, a finished workflow spec, or engineering estimates yet —
> treat every section as a starting point for scoping, not a build spec.

## Overview

Lets Data Portal staff (`dataPortalManager`+) search across organization and service names,
descriptions, and attributes by keyword and/or attribute filter, then review and edit the matching
records without opening each one individually. Solves two problems staff currently have no tooling
for: finding content that's gone stale (e.g. COVID-era language) and finding content that needs
sensitive-language review (e.g. how a service's description talks about who it serves) — both
currently require already knowing which org/service to look at, since there's no way to search by
anything other than org name today (see [Organizations](./README.md)'s "No search across services or
locations" gap). Proposed as its own page under the Organizations section's side nav rather than a
mode of the existing Organization table (see [How It Works](#how-it-works)), since cross-org
discovery is a distinct workflow from the existing per-org directory lookup.

## Access

Proposed at `dataPortalManager` and above (`dataPortalManager`, `dataPortalAdmin`, `root`) —
stricter than the Organizations table itself (`dataPortalBasic`+, see
[Organizations/README.md](./README.md#access)). This is a deliberate floor, not an arbitrary default:
the content this feature surfaces and edits is population-sensitive (target-population language) and
reputationally/legally sensitive (stale public-health guidance), so it's scoped one tier above
ordinary org/service editing. As with every other Data Portal page, whatever tier is settled on here
must be enforced server-side (a real entry in `packages/api/lib/permissions.ts`), not just in the
page's `getServerSideProps` gate — [Reports](./Reports/README.md) already has a documented instance
of a page whose UI gate and server gate don't match; this feature shouldn't repeat that.

## How It Works

_(Proposed — nothing below exists yet.)_

- **UI (nav)**: a new item added to the Organizations section's `organizationsSideNav` array. That
  array is currently duplicated verbatim across
  [`organizations.tsx`](../../../apps/app/src/pages/data-portal/organizations.tsx),
  [`reviews.tsx`](../../../apps/app/src/pages/data-portal/reviews.tsx), and
  [`downloads.tsx`](../../../apps/app/src/pages/data-portal/downloads.tsx) (and presumably
  `reports.tsx`), so adding an item means editing every one of those files, not one shared config —
  see [Known Issues](#known-issues--gotchas).
- **UI (page)**: rendered inside the existing
  [`DataPortalPageShell`](../../../packages/ui/components/data-portal/DataPortalPageShell.tsx)
  (header bar + side nav, `activeSection='organizations'`) — the same shell every other
  Organizations-section page already uses. A new results table, built on the existing
  [`DataTable`](../../../packages/ui/components/data-portal/DataTable/index.tsx) primitive for visual
  consistency with the rest of the tool.
- **UI (result rows)**: master-detail — `Organization` as the parent row, that org's `OrgService`
  row(s) as expandable sub-rows (not `OrgLocation`, unlike the Organizations table's existing
  location sub-rows) — a matching service surfaces nested under its parent org rather than as its
  own flat row.
- **UI (edit, MVP)**: inline edit of `name`/`description` directly in the result row
  (spreadsheet-grid style, à la Airtable/Google Sheets) — each save is still one ordinary
  single-record mutation, not a new batch-mutation engine. No "apply this change to every selected
  row at once" capability in this phase.
- **UI (edit, later phase)**: a guided review step — old/new text shown side by side, confirmed per
  item (track-changes/suggested-edit style) — for anything broader than a one-off inline fix. Not
  designed in detail yet; deliberately never a blind "replace all," since a keyword match can be
  correct for one record and wrong for the next.
- **API (search)**: no existing procedure does this. The only keyword search today
  (`organization.forOrganizationTable`'s `searchIds`, in
  [`query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts))
  is a trigram/unaccent/synonym match against `Organization.name`/`slug`/`id` only — it doesn't touch
  `description` or `OrgService` at all. A new procedure would need to extend that same
  trigram/`immutable_unaccent` approach to also cover `Organization.description` and
  `OrgService.serviceName`/`description` (via their `FreeText`/`TranslationKey` rows), which has no
  search index today (no `tsvector`, no trigram index on that content). This is very likely the
  single biggest unknown in scoping this feature — it's genuinely new infrastructure, not a filter
  bolted onto an existing query.
- **API (attribute filter)**: no new infrastructure needed — reuses `Organization.attributeIds`/
  `serviceIds` (materialized `String[]` + GIN index, `packages/db/prisma/schema.prisma:329-331,
355-356`) the same way `searchDistanceV1/V2/V3` already do. Attribute _labels_ aren't edited by
  this feature — attributes are a fixed taxonomy (`Attribute`/`AttributeCategory`/
  `AttributeSupplement`, `schema.prisma:744,761,799`) used only to help staff find which orgs/services
  have free-text content worth reviewing (e.g. filter to "serves transgender clients" to find
  candidates, then review/edit their _description_ text, not the attribute itself).
- **Data**: `Organization` (`schema.prisma:302`), `OrgService` (`schema.prisma:628`),
  `FreeText`/`TranslationKey` (the i18n join model every name/description goes through —
  `schema.prisma:604,1189`), `AttributeSupplement` (`schema.prisma:799`).
- **Translations**: editing a `FreeText`'s underlying `TranslationKey` is the same source-string
  edit every other content change in this codebase already does — it goes through the standard
  Crowdin sync (`syncDatabaseStringIfChanged`, `packages/crowdin/api/index.ts`) with no new
  mechanism needed. This feature doesn't rewrite existing translations — Crowdin's own
  "source string changed" handling is what flags them for re-review.
- **Audit**: every write rides the existing `getAuditedClient(actorId)` extension
  (`packages/db/client/extensions/auditContext.ts`) — automatic per-row `AuditTrail` entries with no
  new audit mechanism, the same pattern `mutation.duplicate.handler.ts` already uses.

## How to Use It

_(Proposed workflow.)_

1. From the Organizations section's side nav, open this page.
2. Enter keyword(s) to search org and service names/descriptions; optionally narrow using attribute
   filters (e.g. a specific population-served attribute) to find candidates a keyword alone might
   miss or over-match.
3. Results list matching organizations as parent rows, with any matching services shown as
   expandable sub-rows underneath.
4. Edit a name or description inline, directly in the row — saves immediately as an ordinary,
   individually audited edit.
5. _(Later phase)_ For a change under consideration across several results, use guided review to see
   old/new text side by side per item and confirm or skip each one — never a single action applied
   to every matched row at once.

## Known Issues / Gotchas

- **No search index exists yet for the content this feature needs to search.** Attribute-based
  filtering is cheap (existing GIN arrays); keyword search over `description`/`serviceName` text is
  not — it needs new indexing work before any query can be built, unlike everything else in this
  doc.
- **True bulk/batch mutation (one action → N rows) is explicitly out of scope for the first phase.**
  Only per-row inline edits, by design — the goal is fast triage across many candidates, not an
  automated mass-replace, given how context-dependent these edits are (see the guided-review
  rationale above).
- **The side-nav config has no single source of truth.** `organizationsSideNav` is copy-pasted per
  page file today; adding this feature's nav entry means touching every existing page in the
  section, not just adding a new one.
- **Guided review is a concept, not a design yet.** No wireframe, no exact diff UI, no decision on
  whether it's a separate mode or always-on for this feature.
- **Open question**: is every `FreeText`/`TranslationKey` strictly 1:1 with its owning
  `Organization`/`OrgService` row, or can one ever be shared across records? `mutation.duplicate.handler.ts`
  always mints a fresh key rather than reusing the source's, which suggests 1:1 — worth confirming
  before relying on "editing this description can't affect another record" as an assumption.
- **Open question**: keyword vocabulary — does this feature ship with any suggested/canned searches
  (e.g. a maintained list of "outdated" terms like specific COVID-era phrasing), or is it free-text
  entry only, left entirely to staff judgment?

## Related Files

| Path                                                                                                                                                                 | Purpose                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [`docs/DataPortal/2026-Redesign/organization.md`](../2026-Redesign/organization.md)                                                                                  | Backlog entry this doc expands on                                                                               |
| [`docs/DataPortal/Organizations/README.md`](./README.md)                                                                                                             | Parent page doc — the existing Organization table this is a sibling nav item to, not a mode of                  |
| [`duplicate-service.md`](./duplicate-service.md)                                                                                                                     | Precedent for the `FreeText`/Crowdin edit pattern and `getAuditedClient` audit pattern this feature would reuse |
| `packages/db/prisma/schema.prisma` (`Organization` L302, `OrgService` L628, `FreeText` L604, `TranslationKey` L1189, `AttributeSupplement` L799, `AuditTrail` L1378) | Schema this feature reads/writes                                                                                |
| [`packages/api/router/organization/query.forOrganizationTable.handler.ts`](../../../packages/api/router/organization/query.forOrganizationTable.handler.ts)          | Existing trigram/unaccent search pattern (`searchIds`) a new search procedure would extend                      |
| [`packages/api/lib/permissions.ts`](../../../packages/api/lib/permissions.ts)                                                                                        | Where this feature's permission mapping would be added                                                          |
| [`packages/ui/components/data-portal/DataPortalPageShell.tsx`](../../../packages/ui/components/data-portal/DataPortalPageShell.tsx)                                  | Page chrome this feature's page would render inside                                                             |
| [`packages/ui/components/data-portal/DataTable/index.tsx`](../../../packages/ui/components/data-portal/DataTable/index.tsx)                                          | Table primitive a new result-list UI would build on                                                             |
| [`apps/app/src/pages/data-portal/organizations.tsx`](../../../apps/app/src/pages/data-portal/organizations.tsx)                                                      | One of the pages whose duplicated `organizationsSideNav` array would need the new nav entry                     |

---

_Last verified against code: 2026-09-04. This is a proposal — there is no implementation to verify
against yet. Drop the status banner and "proposed" language throughout once building starts._
