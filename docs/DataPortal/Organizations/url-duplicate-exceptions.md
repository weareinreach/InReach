# Org URL Duplicate Check Exceptions

> **Status: Implemented.** Every path below is real, shipped code on `fix/duplicate-org-check`.

## Overview

A Manager+ side-nav page (`/data-portal/org-url-duplicate-check-exceptions`, labeled "URL
Exceptions" in the nav) for maintaining a list of web addresses that are allowed to be shared
across multiple organizations without tripping the org-creation duplicate check. Solves a specific
problem: providers who list themselves on a shared professional-directory site (e.g.
`psychologytoday.com/providerA`, `psychologytoday.com/providerB`) were being flagged as duplicates
of each other just for sharing a domain, even though they're clearly different real
organizations.

Each entry is a **base URL** - a domain (`example.com`) or a deeper path prefix
(`example.com/directory`) - plus a required description, a soft-delete ("Active") toggle, who
added it, and a notes/audit history. Staff add an entry once; every organization afterward whose
website falls under that base URL is exempt from the "same domain" duplicate flag, as long as its
full address isn't the literal same address as one already in use.

## Access

Manager+ at all three layers, confirmed independently and consistent end-to-end:

- **Side nav**: `organizationsSideNav.ts`'s `'URL Exceptions'` item uses
  `MANAGER_AND_ABOVE_PERMISSIONS` (`['dataPortalManager', 'dataPortalAdmin']`; `root` bypasses the
  check unconditionally, so it doesn't need listing).
- **Page SSR**: `getServerSideProps` in the page file below checks
  `['dataPortalManager', 'dataPortalAdmin', 'root']` with `has: 'some'`.
- **tRPC procedures**: every procedure in `orgUrlDuplicateExceptionRouter` (`forTable`, `auditLog`,
  `create`, `update`, `delete`, `unDelete`) requires a permission string that resolves to
  `dataPortalManager` in `packages/api/lib/permissions.ts`; the middleware's role ladder treats
  that as "Manager or Admin" (Admin satisfies anything Manager-gated), plus the unconditional root
  bypass - so the effective access set matches the other two layers exactly.

## How It Works

- **UI (page)**: `apps/app/src/pages/data-portal/org-url-duplicate-check-exceptions.tsx` - renders
  `PageHeading`, an in-page "How exceptions work" `Alert` with worked examples, and
  `OrgUrlDuplicateExceptionTable`.
- **UI (table)**: `packages/ui/components/data-portal/OrgUrlDuplicateExceptionTable.tsx` - standard
  `DataTable` with columns Actions | Base URL | Description | Active | Added By | Created |
  Updated. Expandable rows show every organization currently using an address under that base URL
  (`matchingOrgs`, from `lib/matchingOrgs.ts`), so staff can see who's actually using a domain
  before changing or removing an exception.
- **UI (add/edit)**: `packages/ui/components/data-portal/OrgUrlDuplicateExceptionForm.tsx`, opened
  via `AddOrgUrlDuplicateExceptionModal.tsx` or the table's Edit row action.
- **UI (notes/audit)**: `OrgUrlExceptionNotesDrawer.tsx` (reuses the `InternalNote` pattern - one
  new nullable `orgUrlDuplicateExceptionId` column on that shared table, not a bespoke notes
  field) and `OrgUrlExceptionAuditDrawer.tsx` ("View Activity Log" row action).
- **API (CRUD)**: `packages/api/router/orgUrlDuplicateException/` - `query.forTable`,
  `query.auditLog`, `mutation.create`, `mutation.update`, `mutation.delete`, `mutation.unDelete`.
- **API (matching)**: `packages/api/router/orgUrlDuplicateException/lib/findMatchingException.ts` -
  given a normalized URL, generates every path-segment prefix of it (e.g. `a.com/b/c` ->
  `["a.com/b/c", "a.com/b", "a.com"]`) and looks them up in one `IN` query against `baseUrl`'s
  unique index, returning the most specific **active** match or `null`. This is also what makes
  matching boundary-aware for free: `test.com/dr` can never match an exception on `test.com/drs`,
  since segment prefixes are exact strings, not substrings.
- **API (duplicate-check integration)**: both call sites that flag a website duplicate now consult
  the exceptions list -
  `packages/api/router/organization/query.getPotentialMatches.handler.ts` (the live "already
  matches" check while typing) and
  `packages/api/router/organization/lib/createOrgSuggestion.ts` (the hard block on submit, shared
  by the public Suggest-an-Org form and the Data Portal's Add Org modal). Both apply the same rule:
  a domain-level match is only suppressed when (a) an active exception covers the submitted URL
  and (b) the full URL genuinely differs from every existing match - submitting the exact same
  address twice is still blocked, exception or not.
- **Data**: `OrgUrlDuplicateException` model, `packages/db/prisma/schema.prisma` (~L493-506).
  `baseUrl` is normalized via `normalizeFullUrl` (`packages/util/url/index.ts`) - protocol/`www.`/
  trailing-slash/case stripped, path kept - and is `@unique`.
- **Audit logging**: enabled via migration
  `20261030040000_enable_audit_logging_on_org_url_duplicate_exception`
  (`SELECT audit_trail_enable(to_regclass('public."OrgUrlDuplicateException"'));`). This is a
  per-table opt-in on the generic `AuditTrail` trigger, not automatic for a new table - easy to
  miss (it was missed here initially and fixed in a follow-up migration once staff noticed delete/
  restore/edit cycles weren't showing up in the activity log).

## How to Use It

- **Add a whole site**: enter just the domain, e.g. `example.com`. Any organization afterward with
  a website anywhere under that domain - `example.com/providerA`,
  `example.com/anything/anything-else` - is exempt from the duplicate flag, as long as its address
  isn't identical to one already in use.
- **Add just one section of a site**: enter the deeper address, e.g. `example.com/directory`. Only
  addresses under that specific section are exempt. The bare domain (`example.com`) and any other
  section of that site are **not** covered by this narrower entry - if another organization is
  already somewhere else on that domain, a new org trying to use the bare domain still gets
  blocked. To protect the whole site, list the domain itself, not a section of it.
- **A single address can still only ever be used once.** This is unconditional and has nothing to
  do with the exceptions list - it's true for `example.com` itself, for
  `example.com/directory` itself, and for every other address. The list only changes what happens
  for addresses that are genuinely different from each other.
- **Delete / Restore** (Actions column) is a soft-delete toggle, labeled "Delete"/"Restore" since
  staff already understand the soft-delete convention - deleting an exception means its base URL's
  duplicate check goes back to normal.
- **View Internal Notes** and **View Activity Log** (Actions column) show the change history for
  that entry - who added/edited/deleted/restored it and when.
- Expand a row to see every organization currently matched under that base URL.

## Known Issues / Gotchas

- **A narrower exception doesn't cover the bare domain above it, and that was confirmed as
  intended, not a bug** - if only `example.com/directory` is listed (not `example.com` itself),
  and another org already exists somewhere on that domain, a new org using the bare
  `example.com` address still gets blocked. Walked through explicitly with the feature owner
  (2026-10-30) using concrete `test.com` / `test.com/drs` examples; the in-page "How exceptions
  work" alert and this doc both spell it out so it doesn't resurface as a reported bug. Covered by
  dedicated test cases in `createOrgSuggestion.test.ts` (see below).
  Adding both a domain-wide and a narrower exception for the same domain does not conflict - the
  broader one simply makes the narrower one redundant, since its coverage is a strict subset.
- **Audit history before 2026-10-30 is incomplete** - the audit trigger wasn't enabled on this
  table until the follow-up migration; delete/restore/edit cycles that happened before that
  migration ran are not recoverable.
- No search/filter beyond the table's built-in global search (base URL/description) and
  created/updated date-range filters - nothing special beyond what `DataTable` already provides
  everywhere else.

## Related Files

| Path                                                                                                                                                              | Purpose                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`apps/app/src/pages/data-portal/org-url-duplicate-check-exceptions.tsx`](../../../apps/app/src/pages/data-portal/org-url-duplicate-check-exceptions.tsx)         | Page: permission gate, in-page instructions, renders the table                                      |
| [`packages/ui/components/data-portal/OrgUrlDuplicateExceptionTable.tsx`](../../../packages/ui/components/data-portal/OrgUrlDuplicateExceptionTable.tsx)           | Table UI, expandable matching-orgs sub-rows, row actions                                            |
| [`packages/ui/components/data-portal/OrgUrlDuplicateExceptionForm.tsx`](../../../packages/ui/components/data-portal/OrgUrlDuplicateExceptionForm.tsx)             | Add/Edit form                                                                                       |
| [`packages/ui/components/data-portal/AddOrgUrlDuplicateExceptionModal.tsx`](../../../packages/ui/components/data-portal/AddOrgUrlDuplicateExceptionModal.tsx)     | "Add Base URL" button + modal                                                                       |
| [`packages/ui/components/data-portal/OrgUrlExceptionNotesDrawer.tsx`](../../../packages/ui/components/data-portal/OrgUrlExceptionNotesDrawer.tsx)                 | Internal notes drawer                                                                               |
| [`packages/ui/components/data-portal/OrgUrlExceptionAuditDrawer.tsx`](../../../packages/ui/components/data-portal/OrgUrlExceptionAuditDrawer.tsx)                 | Activity log drawer                                                                                 |
| [`packages/ui/components/data-portal/organizationsSideNav.ts`](../../../packages/ui/components/data-portal/organizationsSideNav.ts)                               | Shared Organizations-section side-nav config, incl. this page's nav item                            |
| [`packages/api/router/orgUrlDuplicateException/index.ts`](../../../packages/api/router/orgUrlDuplicateException/index.ts)                                         | tRPC route registration                                                                             |
| [`packages/api/router/orgUrlDuplicateException/lib/findMatchingException.ts`](../../../packages/api/router/orgUrlDuplicateException/lib/findMatchingException.ts) | Path-segment-prefix exception lookup, shared by both duplicate-check call sites                     |
| [`packages/api/router/orgUrlDuplicateException/lib/matchingOrgs.ts`](../../../packages/api/router/orgUrlDuplicateException/lib/matchingOrgs.ts)                   | Expandable-row "matching organizations" query                                                       |
| [`packages/api/router/orgUrlDuplicateException/query.auditLog.handler.ts`](../../../packages/api/router/orgUrlDuplicateException/query.auditLog.handler.ts)       | Activity log query against `AuditTrail`                                                             |
| [`packages/api/router/organization/query.getPotentialMatches.handler.ts`](../../../packages/api/router/organization/query.getPotentialMatches.handler.ts)         | Live "already matches" duplicate check, consults the exceptions list                                |
| [`packages/api/router/organization/lib/createOrgSuggestion.ts`](../../../packages/api/router/organization/lib/createOrgSuggestion.ts)                             | Submit-time hard block, consults the exceptions list                                                |
| [`packages/api/router/organization/lib/createOrgSuggestion.test.ts`](../../../packages/api/router/organization/lib/createOrgSuggestion.test.ts)                   | Test coverage for every exception-matching scenario, incl. the bare-domain-vs-narrow-exception case |
| [`packages/util/url/index.ts`](../../../packages/util/url/index.ts)                                                                                               | `normalizeToDomain`, `normalizeFullUrl`, `urlMatchesPrefix`                                         |
| [`packages/api/lib/permissions.ts`](../../../packages/api/lib/permissions.ts) (`orgUrlDuplicateExceptions`, ~L66-73)                                              | Permission definitions, all `dataPortalManager`                                                     |
| `packages/db/prisma/schema.prisma` (`OrgUrlDuplicateException` model, ~L493-506)                                                                                  | Schema + index                                                                                      |
| `packages/db/prisma/migrations/20261030040000_enable_audit_logging_on_org_url_duplicate_exception/`                                                               | Enables the `AuditTrail` trigger on this table                                                      |

---

_Last verified against code: 2026-10-30._
