# Quicklink

## Overview

A root-only, cross-organization data-integrity tool for fixing phone/email/
service-location attachment problems across the entire database at once — not
scoped to any single organization. Used occasionally for bulk cleanup, not as part
of any regular staff workflow. Lives at `/data-portal/quicklink/*` (previously
`/admin/quicklink/*`) — the sole side-nav item under the header bar's `System`
section (see [`../README.md`](../README.md)), dropped in unchanged including its
own internal tab bar (Phone Numbers / Email Addresses / Location Services); see
[`docs/DataPortal/2026-Redesign/UI_elements.md`](../../2026-Redesign/UI_elements.md)
for the section-structure design this follows.

## Access

`root` only, on every one of its four pages, checked server-side in each page's
own `getServerSideProps` via `checkServerPermissions({ permissions: 'root', has:
'all' })`. Nobody at the `dataPortalBasic`/`Manager`/`Admin` tiers can reach this
tool at all, regardless of how it's linked from navigation.

## How It Works

- **UI**: four pages under
  [`apps/app/src/pages/data-portal/quicklink/`](../../../../apps/app/src/pages/data-portal/quicklink/) —
  `index.tsx` (landing page, just a tab strip + prompt to pick one), and
  `phone.tsx` / `email.tsx` / `services.tsx`, each a near-identical grouped,
  paginated, editable table (grouped by organization) built directly on
  `@tanstack/react-table` — **not** the shared `DataTable` component the other
  Data Portal pages use.
- **API**: [`packages/api/router/quicklink/`](../../../../packages/api/router/quicklink/) —
  `getPhoneData`/`getEmailData`/`getServiceLocationData` queries, and
  `updatePhoneData`/`updateEmailData`/`updateServiceLocationData` mutations, all
  `permissionedProcedure('dataPortalManager')` at the tRPC layer even though every
  page-level gate above is `root`-only — a stricter UI gate than the API
  technically requires, not a mismatch that lets anyone in (the page itself
  redirects non-root sessions before the query ever runs).
- **Data**: no dedicated model — reads/writes `OrgPhone`/`OrgEmail`/`OrgService`
  attachment fields (`locationOnly`/`serviceOnly`/`published`, and which
  locations/services a record is linked to).

Each page lets an admin bulk-edit records across every organization at once:
toggle whether a phone/email/service-location record is location-only or
service-only, reassign which locations/services it's attached to, and toggle its
`published` flag. Edits accumulate in a form; a floating Save button batches only
the _changed_ rows into diff payloads (`to`/`from` with add/del arrays) sent to
the corresponding mutation.

## How to Use It

- Pick Phone Numbers, Email Addresses, or Location Services from the tab strip —
  each is independent; there's no cross-tab state.
- Edit a row's location-only/service-only checkboxes, attached locations/services,
  or published flag directly in the table.
- Only changed rows are included when you click Save — unchanged rows are
  filtered out client-side before the mutation call.
- Navigating away with unsaved changes prompts a "Save or Discard" confirmation
  modal.

## Known Issues / Gotchas

- Each of the three sub-pages duplicates the same ~500 lines of table/form/
  pagination logic with only the data source swapped — a shared component was
  never factored out.
- Not built on the shared `DataTable` engine the rest of the Data Portal uses, so
  it doesn't get that component's column show/hide, saved-views, or other
  template features for free if those are ever wanted here.
- The tRPC-level permission (`dataPortalManager`) is looser than the page-level
  gate (`root`) — currently harmless since the page redirects non-root sessions
  before any query runs, but worth knowing if this tool is ever linked to more
  broadly.

## Related Files

| Path                                                                                                                                                        | Purpose                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [`apps/app/src/pages/data-portal/quicklink/index.tsx`](../../../../apps/app/src/pages/data-portal/quicklink/index.tsx)                                      | Landing page / tab strip                  |
| [`apps/app/src/pages/data-portal/quicklink/phone.tsx`](../../../../apps/app/src/pages/data-portal/quicklink/phone.tsx)                                      | Phone Numbers editor                      |
| [`apps/app/src/pages/data-portal/quicklink/email.tsx`](../../../../apps/app/src/pages/data-portal/quicklink/email.tsx)                                      | Email Addresses editor                    |
| [`apps/app/src/pages/data-portal/quicklink/services.tsx`](../../../../apps/app/src/pages/data-portal/quicklink/services.tsx)                                | Location Services editor                  |
| `packages/api/router/quicklink/index.ts`                                                                                                                    | tRPC route registration, permission level |
| `packages/api/router/quicklink/query.getPhoneData.handler.ts`, `query.getEmailData.handler.ts`, `query.getServiceLocationData.handler.ts`                   | List queries, one per sub-page            |
| `packages/api/router/quicklink/mutation.updatePhoneData.handler.ts`, `mutation.updateEmailData.handler.ts`, `mutation.updateServiceLocationData.handler.ts` | Diff-based batch update mutations         |

---

_Last verified against code: 2026-09-04._
