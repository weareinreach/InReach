# Reviews

## Overview

Moderation queue for user-submitted organization/service reviews. Staff can hide or
unhide a review (removing it from public view without deleting it) or, at a higher
tier, delete/undelete it outright. Lives at `/data-portal/reviews` (previously the
"Reviews" tab at `/admin`).

## Access

Gated at `dataPortalBasic` and above in this page's own `getServerSideProps`
(`apps/app/src/pages/data-portal/reviews.tsx`).

- **Hide/unhide** — Basic and above.
- **Delete/undelete** — Manager and above (`undeleteUserReview` is on the
  manager-only list in `packages/api/lib/middleware/permissions.ts`, alongside
  `deleteUserReview`).

## How It Works

- **UI**: [`ReviewTable.tsx`](../../../../packages/ui/components/data-portal/ReviewTable.tsx),
  built on the shared
  [`DataTable`](../../../../packages/ui/components/data-portal/DataTable/index.tsx)
  component, rendered from
  [`apps/app/src/pages/data-portal/reviews.tsx`](../../../../apps/app/src/pages/data-portal/reviews.tsx).
- **API**: `review.forReviewTable` in
  [`packages/api/router/review/index.ts`](../../../../packages/api/router/review/index.ts)
  → `query.forReviewTable.handler.ts`
- **Data**: `OrgReview`, joined to the reviewing `User`, `Organization`, and the
  reviewed `OrgService`.

Filtering (visible/deleted/rating), a text search across review content and
user/org/location names, sorting, and pagination all run server-side rather than
loading every review up front. Both the handler and the table's cell renderers
have deliberate null-safety fallbacks (e.g. falling back to a service's
`legacyName`) so a dangling relation — a review pointing at a deleted org/service
— degrades gracefully instead of crashing the table.

## How to Use It

- **ID** is a real column but hidden by default.
- **User** and **User Email** are separate sortable/filterable columns.
- **Rating** renders as `⭐ X/5`; **Created** shows a relative time with a tooltip
  for the exact timestamp; a status badge shows whether a review is currently
  hidden or deleted.
- The **Actions** column holds three icon buttons: a magnifying-glass link to the
  reviewed organization/location page, an eye/eye-off toggle that hides or
  unhides the review immediately (no confirmation step), and — for Manager-tier
  accounts and above only — a delete/undelete button.
- Hide/unhide was previously a `Switch` in a "Visible?" column hidden by default
  (`hiddenByDefault: true`), which meant the control wasn't discoverable at all
  until you opened the column-manager menu — moved into Actions as an icon
  toggle, next to View and Delete, so it's visible by default like every other
  row action. The "Visible?" column still exists (still hidden by default) but
  now exists only to back the toolbar's visible/hidden filter toggle, not to
  render an interactive control — a **Status** badge column already shows the
  same hidden/deleted state at a glance.
- Delete/undelete buttons only appear for Manager-tier accounts and above.
- All hide/unhide/delete/undelete actions are captured automatically in the
  Postgres-level audit trail (no separate logging step needed).

## Known Issues / Gotchas

- No direct editing of review text or rating is supported by design (data
  integrity) — only visibility/deletion state can be changed here.
- **No shared page chrome yet** — this page currently renders standalone, not yet
  inside the new redesign's header bar/side-nav/page-heading shell (in the target
  design this page becomes a side-nav item under Organizations) — that's a later
  phase. See
  [`docs/DataPortal/2026-Redesign/UI_elements.md`](../../2026-Redesign/UI_elements.md).

## Related Files

| Path                                                                                                                   | Purpose                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`apps/app/src/pages/data-portal/reviews.tsx`](../../../../apps/app/src/pages/data-portal/reviews.tsx)                 | Page: permission gate, renders `ReviewTable`                                                                                      |
| [`packages/ui/components/data-portal/ReviewTable.tsx`](../../../../packages/ui/components/data-portal/ReviewTable.tsx) | Table UI                                                                                                                          |
| `packages/api/router/review/query.forReviewTable.handler.ts`                                                           | Prisma query                                                                                                                      |
| `packages/api/router/review/index.ts`                                                                                  | tRPC route registration, permission mapping                                                                                       |
| `packages/api/lib/permissions.ts`                                                                                      | `viewAllReviews: 'dataPortalBasic'` mapping                                                                                       |
| `packages/api/lib/middleware/permissions.ts`                                                                           | Manager-only gate for delete/undelete                                                                                             |
| `packages/ui/components/data-portal/ReviewTable.stories.tsx`                                                           | Storybook file for this table, with MSW mocks for the queries/mutations above — the fastest way to iterate on the UI in isolation |

---

_Last verified against code: 2026-08-30._
