# Data Portal

## Overview

The Data Portal is InReach's internal admin interface at `/admin` (
`apps/app/src/pages/admin/index.tsx`). It's where staff moderate organization data,
user reviews, user-submitted reports, staff accounts, and pull CSV data exports. It
is not customer-facing — access requires a signed-in account with at least
`dataPortalBasic` permission.

Every tab is its own table component under
[`packages/ui/components/data-portal/`](../../packages/ui/components/data-portal/),
backed by its own tRPC router in [`packages/api/router/`](../../packages/api/router/).
There is no shared "data portal" backend module — each tab is an independent
vertical slice (UI table → tRPC procedure → Prisma query), documented separately
below.

## Access tiers

Permission is hierarchical (`root` > `dataPortalAdmin` > `dataPortalManager` >
`dataPortalBasic`). The tab list itself is gated in
`apps/app/src/pages/admin/index.tsx`:

| Tab                                        | Tab visible to | Notes                                                                    |
| ------------------------------------------ | -------------- | ------------------------------------------------------------------------ |
| [Organizations](./Organizations/README.md) | Basic+         | Default tab on load                                                      |
| [Reviews](./Reviews/README.md)             | Basic+         |                                                                          |
| [Reports](./Reports/README.md)             | Basic+         | **Server actually requires Manager+** — see that doc's Known Issues      |
| [Users](./Users/README.md)                 | Manager+       |                                                                          |
| [Downloads](./Downloads/README.md)         | Admin+         | **Server actually only requires Manager+** — see that doc's Known Issues |

Two tabs (Reports, Downloads) have a UI-level permission that doesn't match what the
underlying tRPC procedure actually enforces. Each is documented in its own file
rather than here, since the fix belongs with the rest of that tab's implementation.

## Tabs

- **[Organizations](./Organizations/README.md)** — the org directory's system-of-record
  table: publish status, verification date, locations. Currently loads the entire
  table client-side with no server-side pagination/filtering (see that doc's Known
  Issues — this is a known performance problem under active discussion).
- **[Reviews](./Reviews/README.md)** — moderation queue for user-submitted org/service
  reviews: hide/unhide, delete/undelete.
- **[Reports](./Reports/README.md)** — moderation queue for user-submitted content flags
  ("this listing is wrong/closed/etc.") with a status workflow and internal notes.
- **[Users](./Users/README.md)** — manage staff accounts' Data Portal permission tier and
  trigger password resets.
- **[Downloads](./Downloads/README.md)** — on-demand CSV exports of precomputed
  organization/service aggregate views. See
  [`Downloads/summary.md`](./Downloads/summary.md) for the exact SQL and sample
  output of every report.

## Related documentation

- [`docs/Database/`](../Database/) — schema, models, and computed-field business
  logic referenced throughout these docs (e.g. the audit trail, `Organization`
  indexes).
- [`docs/AccessControl/`](../AccessControl/) — how the permission tiers referenced
  above (`dataPortalBasic`/`Manager`/`Admin`/`root`) are defined and checked.
- [`docs/_templates/`](../_templates/) — the doc format these files follow, and the
  reasoning behind it.

---

_Last verified against code: 2026-08-10._
