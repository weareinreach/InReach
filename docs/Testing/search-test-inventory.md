# Search Feature — Test Case Inventory

## Purpose

A list of every area of the public search surface, and for each area, the test cases that
should exist with their expected result - written **before** any test code, from what the
feature should do, not from reading the implementation and reverse-describing what it
currently does. See [Test Automation Plan](README.md#test-automation-plan) in the main
testing doc for why: a test derived from the code can only confirm the code's current
behavior, bugs included; a test derived from expected behavior fails against a bug instead
of enshrining it.

This is a coverage-tracking document, not a spec of intent frozen in time. As cases are
turned into real tests, update their **Status**. As real product decisions change expected
behavior, update the **Expected** column - don't let this drift into just describing
whatever the code happens to do today.

**Columns:**

- **Layer** - which test tool this case belongs in, per the three-layer split in the main
  doc: **Vitest** (component logic, mocked network), **Chromatic** (visual/CSS layout via
  Storybook snapshot), **Playwright** (real browser, full flow), or **Manual** (not
  practical to automate yet - documented so it isn't silently skipped).
- **Status** - `Not started` / `Partial` / `Covered`, with a pointer to the test file once
  one exists.

This first pass was built from reading the actual current implementation to find where
behavior branches (states, edge cases, conditionals) - that's a legitimate way to find
_where_ to write test cases. The **Expected** column, however, states what should happen,
independent of whether the code agrees; anywhere it doesn't agree with what you observe in
the running app, that's a bug to file, not a reason to change the Expected column to match.

---

## 1. URL / Route Parsing

Route: `/search/[country]/[lon]/[lat]/[dist]/[unit]`, plus `?page=`.

| #   | Given                                               | When        | Expected                                                                                               | Layer                | Status                                                                              |
| --- | --------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------------------------------------- |
| 1.1 | A valid 5-segment URL (`us/-122.1/37.4/50/mi`)      | Page loads  | Results render for that location/radius/unit                                                           | Playwright           | Covered (`home.spec.ts`, via the search-box flow)                                   |
| 1.2 | A malformed URL (missing/non-numeric segment)       | Page loads  | A styled, user-facing error state renders - **not** the current bare `Error` text with no retry action | Playwright           | Not started - current behavior likely fails this; file as a bug once confirmed live |
| 1.3 | `?page=3` with a valid params tuple                 | Page loads  | Page 3's results render, matching the URL, not page 1                                                  | Playwright           | Not started                                                                         |
| 1.4 | `?page=` set to a non-numeric or out-of-range value | Page loads  | Falls back to page 1 rather than crashing or showing an empty/broken state                             | Vitest or Playwright | Not started                                                                         |
| 1.5 | User clicks a pagination link                       | URL updates | `?page=` reflects the new page via shallow update; no full page reload/re-run of `getServerSideProps`  | Playwright           | Not started                                                                         |

## 2. Location Search (`SearchBox`, location mode)

| #   | Given                                                                | When                                        | Expected                                                                                                                                                                                                                        | Layer                                 | Status                                       |
| --- | -------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------- |
| 2.1 | User types a real place name                                         | 400ms debounce elapses                      | Autocomplete suggestions appear                                                                                                                                                                                                 | Playwright                            | Covered (`home.spec.ts`)                     |
| 2.2 | User types a place name                                              | Suggestions are still loading               | A loading indicator shows; no stale/empty dropdown flashes                                                                                                                                                                      | Vitest                                | Not started                                  |
| 2.3 | User types a query with no matching places                           | Debounce elapses                            | No results state shown, no dropdown box with empty content                                                                                                                                                                      | Vitest                                | Not started                                  |
| 2.4 | User selects a suggestion                                            | Selection resolves                          | Browser navigates to `/search/[...params]` with that location's coordinates, default radius (200) and unit (mi)                                                                                                                 | Playwright                            | Covered (`home.spec.ts`)                     |
| 2.5 | User had a custom radius set (e.g. 50mi) on the current results page | User searches a new location and selects it | _Decide the expected behavior_ - does it reset to the 200mi default (current behavior) or preserve the user's chosen radius? This is a real product decision, not an implementation detail - resolve it before writing the test | Playwright                            | Not started - needs a product decision first |
| 2.6 | User presses Enter with suggestions showing                          | -                                           | The top suggestion is submitted, without requiring it to be visually highlighted first                                                                                                                                          | Vitest                                | Not started                                  |
| 2.7 | User has typed text in the box                                       | User clicks the clear (✕) affordance        | Input clears, any dropdown closes                                                                                                                                                                                               | Vitest                                | Not started                                  |
| 2.8 | The geocoding API call fails (network error, rate limit, etc.)       | User selects a suggestion                   | A user-facing error/retry state shows - not a silent failure to navigate                                                                                                                                                        | Playwright or Vitest (mocked failure) | Not started                                  |

## 3. Organization Name Search (`SearchBox`, organization mode)

| #   | Given                                                   | When                             | Expected                                                                   | Layer      | Status      |
| --- | ------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------- | ---------- | ----------- |
| 3.1 | User types a real org name                              | Debounce elapses                 | Matching orgs appear, with the matched substring visually highlighted      | Vitest     | Not started |
| 3.2 | User types a query with no matching orgs                | Debounce elapses, non-blank term | A "suggest a resource" option appears, routing to `/suggest` when selected | Vitest     | Not started |
| 3.3 | Box receives focus with no text typed                   | -                                | Dropdown does **not** open on bare focus                                   | Vitest     | Not started |
| 3.4 | User selects an org result                              | Selection resolves               | Browser navigates to `/org/[slug]` for that org                            | Playwright | Not started |
| 3.5 | A previous location search set `searchState.searchTerm` | Org search box mounts            | Org box does **not** pre-fill with the leftover location text              | Vitest     | Not started |

## 4. Search Results Rendering

| #   | Given                                                                                                | When           | Expected                                                                                                                                                | Layer                   | Status                                                    |
| --- | ---------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------- |
| 4.1 | Results query hasn't resolved yet                                                                    | Page renders   | Skeleton placeholder cards show, not blank space or an error                                                                                            | Vitest                  | Not started                                               |
| 4.2 | Results query returns 0 orgs                                                                         | Query resolves | Empty-results messaging + crisis-support resources render instead of a blank list; sidebar still renders                                                | Vitest                  | Not started                                               |
| 4.3 | Results query returns orgs across multiple proximity tiers                                           | Query resolves | A tier-header divider appears the first time each new tier (Neighborhood/Local/Region/etc.) appears in the ordered list, not once per item in that tier | Vitest                  | Not started                                               |
| 4.4 | Results query fails (network/server error)                                                           | Query rejects  | A user-facing error state renders - confirm this actually happens; the survey found no obviously-handled error path here                                | Vitest (mocked failure) | Not started - verify current behavior first, may be a gap |
| 4.5 | User is on the last page and changes a filter that reduces total pages below the current page number | Filter applied | User isn't left on a now-out-of-range empty page silently                                                                                               | Playwright              | Not started                                               |

## 5. Result Card Content & Navigation

| #   | Given                                                      | When         | Expected                                                                                                             | Layer                | Status      |
| --- | ---------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------- |
| 5.1 | An org serves 4+ distinct cities                           | Card renders | City list shows up to 3 plus "and N more", deduplicated case-insensitively                                           | Vitest               | Not started |
| 5.2 | An org is marked `national`                                | Card renders | No city list shown at all                                                                                            | Vitest               | Not started |
| 5.3 | An org's `addressVisibility` is `HIDDEN`                   | Card renders | No city list shown, regardless of `national`                                                                         | Vitest               | Not started |
| 5.4 | An org serves multiple countries                           | Card renders | A "national"/multi-country badge shows in addition to any leader badge                                               | Vitest               | Not started |
| 5.5 | Org-specific translation override exists for `description` | Card renders | The per-org override text is used, not the generic fallback                                                          | Vitest               | Not started |
| 5.6 | User clicks the org name/title                             | Click fires  | Navigates to `/org/[slug]`; an analytics profile-view event fires with correct position/index/distance/tier metadata | Playwright or Vitest | Not started |

## 6. Favoriting / Saved Lists (`ActionButtons.Save`)

| #   | Given                                             | When                         | Expected                                                                                                                       | Layer                      | Status      |
| --- | ------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ----------- |
| 6.1 | User is not logged in                             | User clicks Save on a result | An auth-promotion modal opens; nothing is saved                                                                                | Vitest (mock `useSession`) | Not started |
| 6.2 | User is logged in, item not yet saved to any list | User clicks Save             | A menu of the user's lists opens, including "create new list"                                                                  | Vitest                     | Not started |
| 6.3 | User is logged in, item saved to exactly one list | User clicks Save             | Item is removed from that list immediately (no menu)                                                                           | Vitest                     | Not started |
| 6.4 | User is logged in, item saved to multiple lists   | User clicks Save             | Menu opens showing membership per list, not a single direct unsave                                                             | Vitest                     | Not started |
| 6.5 | Save mutation succeeds                            | -                            | Success toast shows; item's save state updates immediately without a page refresh (real-cache contract - see main testing doc) | Vitest, real-cache harness | Not started |
| 6.6 | Save mutation fails (network error)               | -                            | Error toast shows; item's displayed save state does not silently flip to "saved"                                               | Vitest (mocked failure)    | Not started |
| 6.7 | The "get all lists" fetch fails                   | Menu opens                   | A retry option shows in the menu, not a permanently broken/empty menu                                                          | Vitest                     | Not started |

## 7. Service Filter (`ServiceFilter`)

| #   | Given                                                    | When                      | Expected                                                                                                                                | Layer  | Status      |
| --- | -------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| 7.1 | Filter options are loading                               | Modal opens               | Skeleton placeholders show                                                                                                              | Vitest | Not started |
| 7.2 | User checks an individual sub-service                    | -                         | Only that sub-service is added to `searchState.services`; results refetch reactively                                                    | Vitest | Not started |
| 7.3 | User checks a category's "select all" checkbox           | -                         | All sub-services in that category are selected; checkbox itself shows checked (not indeterminate)                                       | Vitest | Not started |
| 7.4 | Some but not all sub-services in a category are selected | Category checkbox renders | Shows indeterminate state                                                                                                               | Vitest | Not started |
| 7.5 | User selects several services then closes the modal      | Modal closes              | Selections persist (results already updated reactively before close - closing is presentational only, doesn't itself trigger the query) | Vitest | Not started |
| 7.6 | Component receives `disabled` (intl fallback pages)      | Renders                   | Filter is visibly present but non-interactive                                                                                           | Vitest | Not started |

Scroll-area height across portrait/landscape/desktop (this modal's real three-way responsive
state, not just mobile-vs-desktop) is covered once, jointly with `MoreFilter`'s identical
logic, in section 12's case 12.4 - not duplicated here.

## 8. More Filter / Attributes (`MoreFilter`)

| #   | Given                                                                                               | When            | Expected                                                                                                                                    | Layer  | Status      |
| --- | --------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| 8.1 | An attribute has `filterType` include                                                               | User selects it | Added to the "Include" section and to `searchState.attributes`                                                                              | Vitest | Not started |
| 8.2 | An attribute has `filterType` exclude                                                               | User selects it | Added to the "Exclude" section, distinct from Include                                                                                       | Vitest | Not started |
| 8.3 | Filter selection happens right after initial mount, while the async `values` sync is still settling | -               | The just-applied selection is **not** clobbered by the async sync race (explicit guard exists in code for this - confirm it actually holds) | Vitest | Not started |
| 8.4 | Component receives `disabled` (intl fallback pages)                                                 | Renders         | Visibly present but non-interactive, matching `ServiceFilter`'s pattern                                                                     | Vitest | Not started |

Same note as §7: the portrait/landscape/desktop scroll-height behavior is shared with
`ServiceFilter` and covered jointly in 12.4.

## 9. Community-Focus Sidebar (`SearchResultSidebar`)

| #   | Given                                                                 | When            | Expected                                                                                                       | Layer      | Status      |
| --- | --------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| 9.1 | No focus cookie set, no legacy localStorage value                     | Sidebar mounts  | No switches pre-selected                                                                                       | Vitest     | Not started |
| 9.2 | A legacy localStorage value exists, no cookie yet                     | Sidebar mounts  | Value is migrated to the cookie, localStorage key is removed, results update without a full reload             | Vitest     | Not started |
| 9.3 | Cookie contains a stale/invalid focus ID (e.g. old `"youth"` literal) | Sidebar mounts  | Invalid ID is dropped rather than sent to the API and silently producing a zero-effect boost                   | Vitest     | Not started |
| 9.4 | User toggles a switch on                                              | -               | It's persisted to the cookie, jumps to the top of the active order, and results refetch with the new `focuses` | Vitest     | Not started |
| 9.5 | User drag-reorders two active switches                                | -               | New order persists to the `ir_focus_order` cookie and survives a reload                                        | Playwright | Not started |
| 9.6 | `resultCount === 0`                                                   | Sidebar renders | Focus switches are disabled but still visible (not hidden)                                                     | Vitest     | Not started |
| 9.7 | `isAdvanced` is false (only reachable via `intl/index.tsx` currently) | Sidebar renders | "Coming soon" overlay covers the switch group                                                                  | Vitest     | Not started |
| 9.8 | Sidebar rendered via the mobile drawer (`onlySort`)                   | Renders         | Only the result-count text and focus switches show - no org search box, no suggest link, no anti-hate message  | Vitest     | Not started |

## 10. Sort / Mobile Drawer (`SortResults`)

| #    | Given                         | When                | Expected                                                                                          | Layer                  | Status      |
| ---- | ----------------------------- | ------------------- | ------------------------------------------------------------------------------------------------- | ---------------------- | ----------- |
| 10.1 | Mobile viewport, results page | -                   | A "sort" button is visible above the result list                                                  | Chromatic / Playwright | Not started |
| 10.2 | User taps the sort button     | -                   | A drawer opens containing the same focus-switch controls as the desktop sidebar (`onlySort` mode) | Playwright             | Not started |
| 10.3 | `resultCount === 0`           | Sort button renders | Button is disabled                                                                                | Vitest                 | Not started |

## 11. Pagination

| #    | Given                                   | When           | Expected                                                                                                         | Layer      | Status      |
| ---- | --------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| 11.1 | More results exist than fit on one page | Results render | Pagination control shows the correct total page count                                                            | Vitest     | Not started |
| 11.2 | User is on a page below the last page   | -              | The next page's data is prefetched in the background (verify via network assertion, not just "it doesn't error") | Playwright | Not started |
| 11.3 | User clicks a page number               | -              | `?page=` updates via shallow route change; page scrolls to top; no full `getServerSideProps` re-run              | Playwright | Not started |
| 11.4 | Fewer results than one page's worth     | Results render | Pagination control doesn't show (or shows as inert) - decide and document the expected presentation              | Vitest     | Not started |

## 12. Responsive / Breakpoint Behavior

See the main testing doc's [Plan section](README.md#test-automation-plan) for the
three-layer split (JS-conditional vs. CSS-breakpoint vs. real-flow). Cases specific to
search:

**Important caveat found while auditing this section**: on the main results page
(`[...params]/index.tsx`), `isMobile` is checked only against the `xs` breakpoint (500px) -
there is no separate JS-level "tablet" state there. Everything from 500px up to desktop
widths falls into the single `isMobile === false` branch. So for that page, "tablet" isn't a
distinct _logic_ state to test (12.1/12.2 below already cover its only two JS branches) - the
tablet-specific risk is entirely in the **CSS layer** (does the layout actually look right at
tablet width, even though the JS branch is the same as desktop) and in the one page that
_does_ have a real tablet-only branch (13.x below).

| #    | Given                                                                                                                                     | When                                                                                                                                                     | Expected                                                                                                                                                                                                                                                | Layer                                                  | Status                                                                                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12.1 | Viewport below the `xs` breakpoint (500px)                                                                                                | Results page renders                                                                                                                                     | `isMobile` branch renders: sidebar visually hidden (`hideMobile`), mobile result-count row and sort-drawer trigger appear                                                                                                                               | Vitest (mock `matchMedia`)                             | Not started                                                                                                                                                                        |
| 12.2 | Viewport at/above `xs` (this is the only branch tablet and desktop widths both fall into on this page)                                    | Results page renders                                                                                                                                     | Desktop branch: sidebar shown as a persistent column, no sort-drawer trigger - confirm this looks/works correctly at tablet widths too, not just desktop, since the JS treats them identically                                                          | Vitest                                                 | Not started                                                                                                                                                                        |
| 12.3 | `SearchBox`, `SearchResultCard`, `SearchResultSidebar`, `SearchDistance` Storybook stories, snapshotted at the theme's actual breakpoints | Snapshotted at **`xs` (500, phone)**, **`sm`/`md` (768/1024, tablet - use the `ipad`/`ipad10p` entries already defined in `viewports.ts`)**, and desktop | Layout is correct at each, not just the Storybook default viewport - specifically check `SearchResultSidebar`'s and the results page's `Grid.Col span={{ base: 12, sm: 8, md: 8 }}` column-width shift, which is pure CSS and invisible to Vitest/jsdom | Chromatic                                              | Not started - no `viewport` param currently set on any of the four search stories (confirmed in prior investigation), and none has ever used the `ipad`/`ipad10p` viewport entries |
| 12.4 | `ServiceFilter`/`MoreFilter` modals                                                                                                       | Opened in portrait, in landscape (`(orientation: landscape) and (max-height: 430px)` - the exact query the component itself uses), and at desktop width  | Scroll-area max-height adapts correctly in all three states, not just "mobile vs desktop" - landscape is the state most likely to actually occur on a tablet                                                                                            | Vitest (mock `matchMedia` for each query) or Chromatic | Not started - the existing 7.6/8.x cases only distinguish mobile-portrait vs. desktop; this is a real state the inventory previously missed, not just an unwritten test            |
| 12.5 | Real mobile browser viewport                                                                                                              | Full search flow attempted (search → filter → view result → save)                                                                                        | Every step is completable - no overlapping elements, no unreachable tap targets                                                                                                                                                                         | Playwright (mobile project)                            | Not started - no mobile Playwright project configured yet                                                                                                                          |
| 12.6 | Real tablet browser viewport (e.g. `devices['iPad (gen 7)']`)                                                                             | Same full search flow                                                                                                                                    | Same bar as 12.5 - tablet is a distinct real-device class from both phone and desktop, worth its own Playwright project rather than assuming phone or desktop coverage stands in for it                                                                 | Playwright (tablet project)                            | Not started - no tablet Playwright project configured yet                                                                                                                          |

## 13. International / Out-of-Service-Area Fallback

`search/intl/index.tsx` (no country) and `search/intl/[country].tsx` (specific country).

| #    | Given                                                          | When                                                                                                                                           | Expected                                                                                                                                                                                                                                               | Layer                               | Status                                                                                                                                       |
| ---- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 13.1 | Visitor's location resolves to a country InReach doesn't serve | Landed on `intl/[country]`                                                                                                                     | Page shows the localized country name via `Intl.DisplayNames`, with international crisis resources                                                                                                                                                     | Playwright                          | Not started                                                                                                                                  |
| 13.2 | `[country]` is US, CA, or MX                                   | Page mounts                                                                                                                                    | Client-side redirect to the real `/search/[...params]` results page with a zeroed default tuple                                                                                                                                                        | Playwright                          | Not started                                                                                                                                  |
| 13.3 | Any intl fallback page                                         | Filters render                                                                                                                                 | `ServiceFilter`/`MoreFilter` are visible but disabled/inert - not clickable, not misleadingly interactive                                                                                                                                              | Vitest                              | Not started                                                                                                                                  |
| 13.4 | `intl/index.tsx` specifically (no country context)             | Sidebar renders                                                                                                                                | Focus-switch group shows the "coming soon" overlay (`isAdvanced` defaults false here)                                                                                                                                                                  | Vitest                              | Not started                                                                                                                                  |
| 13.5 | `intl/[country].tsx` specifically                              | Sidebar renders                                                                                                                                | Focus-switch group is **not** overlaid (this page passes `isAdvanged={true}`) but is still functionally inert since `resultCount` is always 0 - decide if this inconsistency between the two intl pages is intentional before locking in as "expected" | Vitest                              | Not started - flag for product/design confirmation                                                                                           |
| 13.6 | `[country]` param fails validation (not a 2-char string)       | `getServerSideProps` runs                                                                                                                      | Returns a real 404, not a broken render                                                                                                                                                                                                                | Playwright                          | Not started                                                                                                                                  |
| 13.7 | `intl/index.tsx` specifically                                  | Viewport is at/below the `sm` breakpoint (768px) - this page's own `isTablet` check, distinct from the `xs` check every other search page uses | A result-count row + divider renders below the search controls                                                                                                                                                                                         | Vitest (mock `matchMedia` for `sm`) | Not started - this is the one genuine tablet-only JS branch found anywhere in the search surface, and had no test case until this audit pass |
| 13.8 | `intl/index.tsx` specifically                                  | Viewport is above `sm`                                                                                                                         | The result-count row does not render                                                                                                                                                                                                                   | Vitest                              | Not started                                                                                                                                  |
| 13.9 | `intl/index.tsx`                                               | Viewport is exactly at the `sm` boundary (768px)                                                                                               | Confirm which side of the boundary `max-width: sm` actually lands on (768px itself: row shows or doesn't) - worth a dedicated boundary test since off-by-one breakpoint bugs are easy to introduce silently in a future edit                           | Vitest                              | Not started                                                                                                                                  |

## 14. Location-Based Alert Banner (`LocationBasedAlertBanner`)

Fetches `LocationAlert` records (admin/CMS-authored content, not code) matching the
searched coordinates via a PostGIS lookup; content and any links are DB-driven, not
hardcoded. Rendered twice - `type='primary'` and `type='secondary'` - each showing only
alerts whose `level` enum suffix matches its type, so a `WARN_PRIMARY` alert never appears
in the secondary slot or vice versa.

| #    | Given                                                                                               | When                                                              | Expected                                                                                                                                                                                                                                                                                                                                                                  | Layer     | Status                                                                  |
| ---- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| 14.1 | `lat`/`lon` resolve to one of the listed US territories/states (PW, AS, UM, MP, MH, US, VI, GU, PR) | Results page renders                                              | Extra top margin/spacing applied around the banner                                                                                                                                                                                                                                                                                                                        | Chromatic | Not started                                                             |
| 14.2 | `lat`/`lon` resolve elsewhere                                                                       | Results page renders                                              | Banner still renders (both `primary` and `secondary` types are unconditional) but without the extra spacing                                                                                                                                                                                                                                                               | Chromatic | Not started                                                             |
| 14.3 | An active alert's text includes a `<Link>` tag                                                      | Banner renders                                                    | The link is always treated as external and opens in a new tab (`target='_blank'`), even if its destination happens to be an internal-looking path - this is unconditional in the component, not content-dependent                                                                                                                                                         | Vitest    | Not started                                                             |
| 14.4 | An active alert's text has no `<Link>` tag                                                          | Banner renders                                                    | Plain text only, nothing clickable in that alert                                                                                                                                                                                                                                                                                                                          | Vitest    | Not started                                                             |
| 14.5 | Alerts of both primary and secondary level match the same location                                  | Results page renders                                              | Primary-level alerts show only in the `type='primary'` instance (above the search controls); secondary-level only in the `type='secondary'` instance (within the results column) - no bleed between the two                                                                                                                                                               | Vitest    | Not started                                                             |
| 14.6 | No active `LocationAlert` matches the searched coordinates                                          | Results page renders                                              | Neither banner instance shows any content - confirm this renders as genuinely empty (no empty box/border) rather than an awkward blank space                                                                                                                                                                                                                              | Vitest    | Not started                                                             |
| 14.7 | An alert is showing                                                                                 | User revisits the same location later (same session or a new one) | The alert reappears identically every time - there is no dismiss/close action or persistence of any kind in this component, unlike the anti-hate modal or cookie consent banner (see [site-chrome-test-inventory.md](site-chrome-test-inventory.md)). Confirm this always-reappears behavior is intended for a location-safety alert (plausible) rather than an oversight | Manual    | Not started - confirm intent before treating as fixed expected behavior |

## 15. Known Non-Goals / Dead Code (do not write tests here until re-enabled)

Flagged explicitly so these aren't silently assumed covered, and so nobody spends time
testing something not actually reachable by users:

- **`SearchDistance.tsx`** (radius slider + "include remote" checkbox) - not rendered
  anywhere reachable from the live search page (commented out in `SearchResultSidebar`).
  Its own param schema also doesn't match the current route's actual segment order, so it
  would likely need a real fix, not just an uncomment, before it could be re-enabled.
- **`isAdvanced = false` path on the main results page** - the main results page hardcodes
  `isAdvanced = true` with no code path that sets it otherwise; the `false` branch (tier
  dividers suppressed, etc.) is only actually reachable via `search/intl/index.tsx`, not the
  primary flow. Covered under section 13, not section 4.
- **Map view** - no map component is wired into the search results page at all (`GoogleMap`
  exists in the UI package but isn't imported here). Not a gap to test; there's no feature
  here yet.
- **URL-synced filters** - `services`/`attributes`/community-focus are _not_ reflected in the
  URL on the results page (only location/radius/unit/country and page number are). A
  `getRoute()` helper that _would_ serialize them exists but is only used elsewhere
  (`MobileNav`, `Breadcrumb`) for "back to search" links. If "shareable filtered search URL"
  is a real expectation, that's a feature gap, not a test gap - resolve as a product decision
  before adding a test case that would just fail against current-by-design behavior.

---

_Companion to [docs/Testing/README.md](README.md). Built from a read of the actual
`apps/app/src/pages/search/**` and related `packages/ui` components as of 2026-09-20 - update
both the inventory and that date if the underlying components change shape._
