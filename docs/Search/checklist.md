# Search V2 (Empowered Search) Implementation Checklist

This checklist tracks the status of the Search V2 upgrade, ensuring all architectural decisions, UI requirements, and performance optimizations are implemented.

## 1. Backend & Core Logic

- [ ] **Schema Definition**: Create `query.searchDistanceV2.schema.ts` with support for:
  - `priorityTags` (Record<string, number>)
  - `sortBias` (DISTANCE | RELEVANCE)
  - `matchMode` (AND | OR)
  - `includeNational` (Boolean)
  - Dynamic `dist` (Radius slider support)
- [ ] **Mathematical Engine**: Implement `relevanceScore.ts` logic:
  - Dampened Reciprocal for distance decay.
  - Exponential weighting for Priority 1-N.
  - Verified Bonus points.
  - Service Match Boosting (for OR mode).
  - Deterministic Tie-Breakers (Verified > Rating > Slug).
- [ ] **Configuration**: Finalize initial weights in `searchConfig.ts`.
- [ ] **API Handler**: Create `query.searchDistanceV2.handler.ts`:
  - Implement "National" pre-filtering CTE.
  - Integrate `relevanceScore.ts` fragments into `$queryRaw`.
  - Implement performance safeguard (only score orgs matching at least one filter in OR mode).

## 2. Database Optimizations

- [ ] **Performance Indexing**: Create and run the GIN index migration for:
  - `OrgServiceTag` (`tagId`)
  - `AttributeSupplement` (`attributeId`)
- [ ] **Validation**: Run `EXPLAIN ANALYZE` on the V2 query to verify index usage.

## 3. Frontend UI Components

- [ ] **V2 Sidebar**: Implement `SearchResultSidebarV2.tsx`:
  - Add "Update Results" explicit trigger button.
  - Add "Tune Search Priority" modal trigger.
  - Implement Community Focus multi-select (1-5 limit).
- [ ] **Advanced Search Modal**: Implement `AdvancedSearchModal.tsx`:
  - Match Mode toggle (AND vs OR).
  - Sort Bias toggle (Distance vs Best Fit).
  - Radius Slider (1-200 miles).
  - National/Remote toggle.
  - **Priority Ranking UI**: Drag-and-drop or numbered ordering for selected focuses.
- [x] **Advanced Search Toggle**: Implement `AdvancedSearchToggle.tsx` to handle route and persistence.
- [ ] **Legacy Entry Point**: Update `SearchResultSidebar.tsx` (V1) to include the "Try Search V2 (Beta)" link.
- [ ] **Routing**: Set up the `/search/v2` page to house the new experience side-by-side with `/search`.

## 4. Analytics & Observability

- [ ] **Tracker Utility**: Create `search-v2-tracker.ts` in the analytics package.
- [ ] **Event Wiring**:
  - Track `advanced_search_opened` and `advanced_search_closed`.
  - Track `search_v2_applied` with parameter metadata.
  - Track `priority_tags_configured`.
  - Track results summary and latency.
- [ ] **A/B Metrics**: Update result click tracking to include `search_version`.

## 5. Staff & Admin Tools

- [ ] **Search Debug Mode**:
  - Implement a staff-only UI toggle for "Debug Mode".
  - Show raw `relevance_score` on result cards.
  - Provide a tooltip or overlay with the score breakdown (Distance pts vs Priority pts).

## 6. QA & Verification (Scenario Testing)

- [ ] **Proximity Sort**: Basic search defaults to pure mileage order.
- [ ] **Match Any (OR)**: Verify that selecting 2 services doesn't hide orgs that only provide one.
- [ ] **Match All (AND)**: Verify that selecting 2 services hides orgs missing either one.
- [ ] **Priority Bubble**: Verify that a Priority #1 match jumps higher than a Priority #3 match at the same distance.
- [ ] **Best Fit Bias**: Verify that in "Best Match" mode, a highly relevant org 20 miles away outranks a non-relevant org 1 mile away.
- [ ] **National Grouping**: Verify national orgs appear at the end of the local list by default.
- [ ] **Fallback Logic**: Verify the "No priority matches found" message appears when the radius search has 0 relevance matches.
- [ ] **Tie-Breaking**: Verify consistent ordering between Org A and Org B when scores are identical.

## 7. Documentation & Deployment

- [ ] **Readme/Wiki**: Ensure `search_relevance.md` is synced with final code.
- [ ] **Beta Feedback**: Set up a channel or form for staff to report "Best Match" tuning issues.
- [ ] **Migration Check**: Ensure GIN indexes are applied to production DB before flipping the public A/B test.
