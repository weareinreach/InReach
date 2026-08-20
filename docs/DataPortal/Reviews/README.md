# Reviews Tab

## Overview

Moderation queue for user-submitted organization/service reviews. Staff can hide or
unhide a review (removing it from public view without deleting it) or, at a higher
tier, delete/undelete it outright.

## Access

Visible to `dataPortalBasic` and above.

- **Hide/unhide** — Basic and above.
- **Delete/undelete** — Manager and above (`undeleteUserReview` is on the
  manager-only list in `packages/api/lib/middleware/permissions.ts`, alongside
  `deleteUserReview`).

## How It Works

- **UI**: [`ReviewTable.tsx`](../../../packages/ui/components/data-portal/ReviewTable.tsx),
  built on the shared
  [`DataTable`](../../../packages/ui/components/data-portal/DataTable/index.tsx)
  component.
- **API**: `review.forReviewTable` in
  [`packages/api/router/review/index.ts`](../../../packages/api/router/review/index.ts)
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
- The magnifying-glass action links directly to the reviewed organization or
  location page.
- The visibility **Switch** toggles hide/unhide immediately — no confirmation step.
- Delete/undelete buttons only appear for Manager-tier accounts and above.
- All hide/unhide/delete/undelete actions are captured automatically in the
  Postgres-level audit trail (no separate logging step needed).

## Known Issues / Gotchas

- No direct editing of review text or rating is supported by design (data
  integrity) — only visibility/deletion state can be changed here.

## Related Files

| Path                                                                                                                | Purpose                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/ui/components/data-portal/ReviewTable.tsx`](../../../packages/ui/components/data-portal/ReviewTable.tsx) | Table UI                                                                                                                          |
| `packages/api/router/review/query.forReviewTable.handler.ts`                                                        | Prisma query                                                                                                                      |
| `packages/api/router/review/index.ts`                                                                               | tRPC route registration, permission mapping                                                                                       |
| `packages/api/lib/permissions.ts`                                                                                   | `viewAllReviews: 'dataPortalBasic'` mapping                                                                                       |
| `packages/api/lib/middleware/permissions.ts`                                                                        | Manager-only gate for delete/undelete                                                                                             |
| `packages/ui/components/data-portal/ReviewTable.stories.tsx`                                                        | Storybook file for this table, with MSW mocks for the queries/mutations above — the fastest way to iterate on the UI in isolation |

---

_Last verified against code: 2026-08-19._
