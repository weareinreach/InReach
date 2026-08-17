# Reviews (public-facing)

## Overview

Public display of org/location/service ratings and reviews — the star rating + count badge
shown across search results and listing pages, review submission, and the full review list
on an org/location page. This doc currently covers the **rating display** in depth (the
piece that has an actual test — `packages/ui/components/core/Rating.test.tsx`); review
submission and the full review list are noted below but not yet documented in the same
depth. Not to be confused with [`docs/DataPortal/Reviews/`](../DataPortal/Reviews/README.md),
which covers the **staff moderation queue** (hide/delete a review) — a different, admin-only
feature built on the same `OrgReview` data.

## How It Works

- **UI (rating badge)**: [`Rating.tsx`](../../packages/ui/components/core/Rating.tsx) —
  shows a star icon + average rating + review count (e.g. "4.5 (12 reviews)"), or "No
  reviews yet" when `count` is 0. Used on org headers
  ([`ListingBasicInfo.tsx`](../../packages/ui/components/sections/ListingBasicInfo.tsx)),
  search result cards ([`LocationCard.tsx`](../../packages/ui/components/sections/LocationCard.tsx)),
  the reviews section ([`Reviews.tsx`](../../packages/ui/components/sections/Reviews.tsx)),
  and the review submission flow
  ([`UserReviewSubmit.tsx`](../../packages/ui/components/core/UserReviewSubmit.tsx)).
- **API**: `review.getAverage` in
  [`packages/api/router/review/query.getAverage.handler.ts`](../../packages/api/router/review/query.getAverage.handler.ts)
  — a single polymorphic query: pass an organization, location, or service ID and it
  aggregates `OrgReview.rating` (`_avg`/`_count`) scoped to whichever one you passed. One
  handler backs the rating badge everywhere it appears, not a separate query per level.
- **Pluralization**: the count text comes from the `common` namespace's
  `review-count_interval`/`review-count_one`/`review-count_other` keys, via
  `i18next-intervalplural-postprocessor` (0 → "No reviews yet", 1 → singular, 2+ → plural).
  This is the exact behavior `Rating.test.tsx` verifies against real locale content.
- **Not yet documented in this depth**: review submission (`UserReviewSubmit.tsx` +
  `review.create`) and the full review list (`Reviews.tsx` + `review.getByOrg`/
  `getByLocation`/`getByService`/`getFeatured`) — both real, working features, just not
  traced through in this pass. Extend this doc when either gets touched next.

## Known Issues / Gotchas

- `review.getFeatured` (used on the homepage) has a live, currently-unresolved
  `PrismaClientKnownRequestError` on `orgReview.findMany()` seen in local dev testing during
  the i18next work — unrelated to ratings/i18n, not yet root-caused. Worth checking before
  assuming the homepage's featured-reviews section is fully healthy.

## Related Files

| Path                                                          | Purpose                                               |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| `packages/ui/components/core/Rating.tsx`                      | Rating badge component                                |
| `packages/ui/components/core/Rating.test.tsx`                 | Unit test - zero/singular/plural/loading states       |
| `packages/api/router/review/query.getAverage.handler.ts`      | Polymorphic average+count query                       |
| `packages/api/router/review/query.getAverage.schema.ts`       | Input schema (org/location/service ID)                |
| `apps/app/public/locales/en/common.json`                      | `review-count_*` pluralization keys                   |
| `packages/ui/components/sections/Reviews.tsx`                 | Full review list (not yet documented in depth)        |
| `packages/ui/components/core/UserReviewSubmit.tsx`            | Review submission flow (not yet documented in depth)  |
| [`docs/DataPortal/Reviews/`](../DataPortal/Reviews/README.md) | Sibling doc: staff moderation queue for the same data |

---

_Last verified against code: 2026-08-17. If you change any file listed above, update this
doc in the same PR and bump this date._
