# Data Portal

## Overview

The Data Portal is InReach's internal staff tool, now at `/data-portal` (previously
`/admin` — renamed as part of the 2026 redesign; see
[`2026-Redesign/UI_elements.md`](./2026-Redesign/UI_elements.md)). It's where staff
moderate organization data, user reviews, user-submitted reports, staff accounts,
pull CSV data exports, and (root only) run cross-org data-integrity tooling. It is
not customer-facing — access requires a signed-in account with at least
`dataPortalBasic` permission.

As of the 2026 redesign's first implementation pass, each former "tab" is now its
own standalone page/route rather than a client-side tab within one shared `/admin`
page — see "Pages" below for the current URLs. Each is still its own table
component under
[`packages/ui/components/data-portal/`](../../packages/ui/components/data-portal/),
backed by its own tRPC router in [`packages/api/router/`](../../packages/api/router/).
There is no shared "data portal" backend module — each page is an independent
vertical slice (UI table → tRPC procedure → Prisma query), documented separately
below. The shared page chrome (header bar, side navigation, per-page heading) has
not landed yet — that's a later phase of the same redesign.

## Access tiers

Permission is hierarchical (`root` > `dataPortalAdmin` > `dataPortalManager` >
`dataPortalBasic`). Each page gates itself independently in its own
`getServerSideProps` (previously this was one shared check in
`apps/app/src/pages/admin/index.tsx`; now each page under
`apps/app/src/pages/data-portal/` owns its own):

| Page                                       | Route                        | Gated at | Notes                                                                  |
| ------------------------------------------ | ---------------------------- | -------- | ---------------------------------------------------------------------- |
| [Organizations](./Organizations/README.md) | `/data-portal/organizations` | Basic+   | Default landing page — `/data-portal` redirects here                   |
| [Reviews](./Reviews/README.md)             | `/data-portal/reviews`       | Basic+   |                                                                        |
| [Reports](./Reports/README.md)             | `/data-portal/reports`       | Basic+   | **Server still requires Manager+** — see that doc's Known Issues       |
| [Manage Users](./Users/README.md)          | `/data-portal/manage-users`  | Manager+ | Renamed from "Users" to match the redesign's naming                    |
| [Downloads](./Downloads/README.md)         | `/data-portal/downloads`     | Manager+ | Corrected from Admin+ as part of the route move — see that doc's notes |
| [Quicklink](./Quicklink/README.md)         | `/data-portal/quicklink/*`   | `root`   | Cross-org data-integrity tooling, unrelated to the other pages' theme  |

Reports still has a UI-level permission that doesn't match what the underlying
tRPC procedure enforces (documented in its own file, since the fix belongs with the
rest of that page's implementation). Downloads' equivalent mismatch was fixed as
part of this relocation, since it only required a frontend threshold change.

## Pages

- **[Organizations](./Organizations/README.md)** — the org directory's system-of-record
  table: publish status, verification date, locations. Currently loads the entire
  table client-side with no server-side pagination/filtering (see that doc's Known
  Issues — this is a known performance problem under active discussion).
- **[Reviews](./Reviews/README.md)** — moderation queue for user-submitted org/service
  reviews: hide/unhide, delete/undelete.
- **[Reports](./Reports/README.md)** — moderation queue for user-submitted content flags
  ("this listing is wrong/closed/etc.") with a status workflow and internal notes.
- **[Manage Users](./Users/README.md)** — manage staff accounts' Data Portal permission
  tier and trigger password resets.
- **[Downloads](./Downloads/README.md)** — on-demand CSV exports of precomputed
  organization/service aggregate views. See
  [`Downloads/summary.md`](./Downloads/summary.md) for the exact SQL and sample
  output of every report.
- **[Quicklink](./Quicklink/README.md)** — root-only bulk data-integrity tooling for
  fixing cross-org phone/email/service-location attachment problems. Unlike the other
  five pages, it isn't part of the Organizations/Admin/Tasks section structure the
  redesign introduces — see its own doc for why.

## Related documentation

- [`2026-Redesign/UI_elements.md`](./2026-Redesign/UI_elements.md) — the in-progress
  redesign this rename/relocation is the first implementation pass of: target
  layout, routing decisions, and what's deferred to later phases.
- [`docs/Database/`](../Database/) — schema, models, and computed-field business
  logic referenced throughout these docs (e.g. the audit trail, `Organization`
  indexes).
- [`docs/AccessControl/`](../AccessControl/) — how the permission tiers referenced
  above (`dataPortalBasic`/`Manager`/`Admin`/`root`) are defined and checked.
- [`docs/_templates/`](../_templates/) — the doc format these files follow, and the
  reasoning behind it.

---

_Last verified against code: 2026-08-30._
