# Content Search & Bulk Edit

> **Status: Proposed.** This doc captures a design discussion, not shipped code — every path,
> component, and procedure named below describes a proposal, not an existing file, unless explicitly
> marked "existing." Originally scoped as an unstarted backlog item in
> [`docs/DataPortal/2026-Redesign/organization.md`](../2026-Redesign/organization.md#content-search--bulk-edit).
> Nothing here has permission sign-off, a finished workflow spec, or engineering estimates yet —
> treat every section as a starting point for scoping, not a build spec.

## Overview

Lets Data Portal staff (`dataPortalManager`+) search across organization and service names,
descriptions, and attributes by keyword and/or attribute filter, then act on what they find without
opening each record individually, via three distinct workflows: edit one record's text inline,
find-and-replace a text pattern across several with a mandatory per-record preview before anything is
written, or bulk-add/remove a structured attribute or service tag across a selected set. Solves two
problems staff currently have no tooling for: finding content that's gone stale (e.g. COVID-era
language) and finding content that needs sensitive-language review (e.g. how a service's description
talks about who it serves) — both currently require already knowing which org/service to look at,
since there's no way to search by anything other than org name today (see
[Organizations](./README.md)'s "No search across services or locations" gap). Proposed as its own
page under the Organizations section's side nav rather than a mode of the existing Organization table
(see [How It Works](#how-it-works)), since cross-org discovery is a distinct workflow from the
existing per-org directory lookup.

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
- **UI (find & replace, later phase)**: a second "Replace with" field appears alongside the search
  box — the search box's own query doubles as the "find" term, rather than a separate field, so
  there's one query, not two to keep in sync. Typing a replacement computes a **preview per matching
  record** (old text with the matched span struck through, new text with the substitution applied)
  before anything is written — never a single "replace all, no preview" action. Every previewed row
  carries its own checkbox, checked by default; **"Replace Selected (N)"** applies only to what's
  still checked, so confirming everything at once is one click, but excluding a specific record that
  shouldn't change is equally one click, before the write happens rather than after. This is
  deliberately **not** the same as a blind find/replace: a keyword match can be correct for one record
  and wrong for the next (e.g. searching a term and finding it used both in a sentence that should
  change and one that shouldn't), so the human still reads every instance — the preview step is what
  makes bulk replacement safe to offer at all, not an optimization on top of it.
- **UI (per-item manual edit, complementary)**: for matches that need a bespoke rewrite rather than a
  literal substitution, the plain inline-edit (above) already covers it — search surfaces the
  candidates, a person reads each one in its own context and writes whatever the fix should be. This
  and find & replace are two paths to the same set of matches, not a phase-gated sequence; which one
  fits depends on whether the same literal substitution is actually correct everywhere it matches.
- **UI (bulk attribute / service-tag update, later phase)**: a leading checkbox column on every
  result row (org and service rows both selectable independently) plus a toolbar action — choose
  **Add** or **Remove**, then a specific `Attribute` or `ServiceTag` from the existing fixed taxonomy
  (never free text, so there's no phrasing-nuance risk here the way there is with description text).
  Preview shows which selected records already carry it (would no-op) vs. which would actually
  change, then a single confirm applies it across every checked row. Lower-risk than text
  find/replace by construction — attaching/detaching a structured tag is binary, not a judgment call
  about wording — but still preview-then-confirm, never silent, since mistagging which orgs serve a
  given population is a real, user-facing correctness issue on its own.
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
- **API (bulk mutations)**: neither find & replace nor the attribute/tag update needs a new
  transactional batch endpoint — both are a loop of the existing single-record mutations (the same
  `name`/`description` update path inline edit already uses; `attachServiceAttribute`/
  `attachServiceTags`-equivalent calls for the tag/attribute case), issued once per confirmed row from
  the client, each independently audited. A partial failure partway through is a normal, expected
  outcome to design for (report N succeeded / M failed, not an all-or-nothing transaction) — not a
  single-endpoint batch job in the `mutation.duplicate.handler.ts` sense.
- **Data**: `Organization` (`schema.prisma:302`), `OrgService` (`schema.prisma:628`),
  `FreeText`/`TranslationKey` (the i18n join model every name/description goes through —
  `schema.prisma:604,1189`), `AttributeSupplement` (`schema.prisma:799`), `ServiceTag`/`OrgServiceTag`
  (`schema.prisma:870`, the fixed taxonomy for what a service offers, distinct from `Attribute`).
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
   individually audited edit. Use this when the fix isn't the same words everywhere it matches.
5. _(Later phase)_ Or, when the same substitution really is correct everywhere: type a "Replace with"
   value next to the search box. Every matching row previews its own before/after; uncheck any row
   that shouldn't change, then confirm — nothing is written until that confirm, and nothing is ever
   applied to a row without its own preview having been shown first.
6. _(Later phase)_ Or, to add or remove a structured attribute/service tag across several
   orgs/services at once: check the rows that apply, choose Add or Remove and a value from the
   toolbar, review which checked rows would actually change, and confirm.

## Known Issues / Gotchas

- **No search index exists yet for the content this feature needs to search.** Attribute-based
  filtering is cheap (existing GIN arrays); keyword search over `description`/`serviceName` text is
  not — it needs new indexing work before any query can be built, unlike everything else in this
  doc.
- **True bulk mutation is in scope, but only ever behind a per-record preview + explicit confirm.**
  MVP ships inline edit only; find/replace and the attribute/tag update (both preview-gated, both
  described above) are later-phase, not MVP. What's still explicitly ruled out at every phase is a
  single "apply with no preview" action — that's the one shape of bulk edit this feature should never
  offer, not bulk editing itself.
- **The side-nav config has no single source of truth.** `organizationsSideNav` is copy-pasted per
  page file today; adding this feature's nav entry means touching every existing page in the
  section, not just adding a new one.
- **Open question**: is every `FreeText`/`TranslationKey` strictly 1:1 with its owning
  `Organization`/`OrgService` row, or can one ever be shared across records? `mutation.duplicate.handler.ts`
  always mints a fresh key rather than reusing the source's, which suggests 1:1 — worth confirming
  before relying on "editing this description can't affect another record" as an assumption. This
  matters more now than it did for inline-edit-only: find & replace touching N records at once makes
  a shared-key assumption failure much more visible if it's ever wrong.
- **Open question**: keyword vocabulary — does this feature ship with any suggested/canned searches
  (e.g. a maintained list of "outdated" terms like specific COVID-era phrasing), or is it free-text
  entry only, left entirely to staff judgment?
- **Open question**: find & replace's matching is assumed case-insensitive with a literal
  (non-case-preserving) substitution — i.e. the replacement text is inserted exactly as typed,
  regardless of the matched text's original casing. Not confirmed as the right default, just the
  simplest one.
- **Open question**: should certain terms get extra friction (a confirmation step beyond the normal
  preview, or simply be excluded from find & replace entirely) given how easily a mechanical
  substitution can produce something clinically or contextually wrong — e.g. substituting crisis-related terminology is a case where getting the "replacement" itself wrong is its own harm, not
  just a matter of missing a record. Not designed; flagged here so it doesn't get silently skipped
  when this is actually scoped.

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
| [`packages/api/router/service/mutation.attachServiceAttribute.handler.ts`](../../../packages/api/router/service/mutation.attachServiceAttribute.handler.ts)          | Single-record attribute-attach precedent the bulk attribute/tag update would loop                               |
| [`packages/api/router/service/mutation.attachServiceTags.handler.ts`](../../../packages/api/router/service/mutation.attachServiceTags.handler.ts)                    | Single-record service-tag-attach precedent the bulk attribute/tag update would loop                             |

---

_Last verified against code: 2026-09-04. This is a proposal — there is no implementation to verify
against yet. Drop the status banner and "proposed" language throughout once building starts._
