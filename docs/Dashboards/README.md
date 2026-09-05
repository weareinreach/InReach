# Dashboards

## Overview

A top-level staff area at `/dashboards`, distinct from `/data-portal` — deliberately not nested under
it, since the intent is to grow this into several dashboards, some gated and some eventually
public-facing, which would read oddly under an internal-tool route prefix. Today it holds one entry:
**[Unpublished Status](./UnpublishedStatus/README.md)**.

## Access

Gated at `dataPortalManager`/`dataPortalAdmin`/`root` (`has: 'some'`) in
[`apps/app/src/pages/dashboards/index.tsx`](../../apps/app/src/pages/dashboards/index.tsx)'s own
`getServerSideProps` — one tier stricter than Data Portal's own `dataPortalBasic` floor. Each
dashboard listed also gates itself independently (see its own doc).

## How It Works

- **UI**: [`apps/app/src/pages/dashboards/index.tsx`](../../apps/app/src/pages/dashboards/index.tsx)
  renders a static `DASHBOARDS` array as a card grid — adding a new dashboard means adding an entry
  here plus its own route folder, there's no dynamic registry.
- **API**: each dashboard has its own namespace under
  [`packages/api/router/dashboard/`](../../packages/api/router/dashboard/) (e.g. `dashboard.unpublishedStatusSummary`).

## Related Files

| Path                                                                                       | Purpose                                       |
| ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| [`apps/app/src/pages/dashboards/index.tsx`](../../apps/app/src/pages/dashboards/index.tsx) | Landing page, the `DASHBOARDS` registry array |
| [`packages/api/router/dashboard/`](../../packages/api/router/dashboard/)                   | Per-dashboard tRPC procedures                 |
| [`UnpublishedStatus/README.md`](./UnpublishedStatus/README.md)                             | The one dashboard that exists today           |

---

_Last verified against code: 2026-09-04._
