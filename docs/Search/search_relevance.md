# InReach Search Algorithm Upgrade

<!-- TOC -->

- [1. Big Picture Vision](#1-big-picture-vision)
  - [1.1. User-Led Prioritization](#11-user-led-prioritization)
  - [1.2. Flexible Matching](#12-flexible-matching)
  - [1.3. Distance vs. Fit](#13-distance-vs-fit)
- [2. Phase 1 Scope](#2-phase-1-scope)
  - [2.1. Scoring Factors (Phase 1)](#21-scoring-factors-phase-1)
- [3. UI Requirements](#3-ui-requirements)
  - [3.1. Big Picture (Future State)](#31-big-picture-future-state)
  - [3.2. Phase 1 (Immediate Needs)](#32-phase-1-immediate-needs)
  - [3.3. Filter Definitions](#33-filter-definitions)
- [4. Technical Architecture & Decisions](#4-technical-architecture--decisions)
  - [4.1. Side-by-Side Implementation (V2 Strategy)](#41-side-by-side-implementation-v2-strategy)
  - [4.2. Explicit Search Trigger](#42-explicit-search-trigger)
  - [4.3. Candidates and Indexing](#43-candidates-and-indexing)
  - [4.4. Performance Safeguard](#44-performance-safeguard)
  - [4.5. Deterministic Tie-Breaking](#45-deterministic-tie-breaking)
  - [4.6. System Tuning vs. User Control (Code-Based Config)](#46-system-tuning-vs-user-control-code-based-config)
  - [4.7. The "Weighting Contract" (Industry Standards)](#47-the-weighting-contract-industry-standards)
  - [4.8. Toggle Mechanism](#48-toggle-mechanism)
  - [4.9. Backend Logic (Shared Utility)](#49-backend-logic-shared-utility)
- [5. Implementation Steps](#5-implementation-steps)
  - [5.1. Step 1: V2 Foundation (MVP)](#51-step-1-v2-foundation-mvp)
- [6. User Experience Scenarios & Examples](#6-user-experience-scenarios--examples)
  - [6.1. Scenario 1: Basic Search (Default)](#61-scenario-1-basic-search-default)
  - [6.2. Scenario 2: Service Filtering](#62-scenario-2-service-filtering)
  - [6.3. Scenario 3: Multiple Services (AND vs OR)](#63-scenario-3-multiple-services-and-vs-or)
  - [6.4. Scenario 4: Just "More Options"](#64-scenario-4-just-more-options)
  - [6.5. Scenario 5: Service + More Options (AND vs OR)](#65-scenario-5-service--more-options-and-vs-or)
  - [6.6. Scenario 6: Community Focus Priority](#66-scenario-6-community-focus-priority)
  - [6.7. Scenario 7: Distance vs. Best Match](#67-scenario-7-distance-vs-best-match)
  - [6.8. Scenario 8: National vs. Local](#68-scenario-8-national-vs-local)
  - [6.9. Scenario 9: The Tie-Breaker](#69-scenario-9-the-tie-breaker)
- [7. QA Checklist & Verification](#7-qa-checklist--verification)
- [8. Analytics & Monitoring](#8-analytics--monitoring)
  - [8.1. Feature Discovery & Engagement](#81-feature-discovery--engagement)
  - [8.2. Search Performance & Quality](#82-search-performance--quality)
  - [8.3. Conversion & Relevance (A/B Metrics)](#83-conversion--relevance-ab-metrics)
  - [8.4. Technical Health](#84-technical-health)
- [9. Strategic Recommendations](#9-strategic-recommendations)
  - [9.1. Internal "Search Debug" Mode](#91-internal-search-debug-mode)
- [10. Legacy/Standard Search Behavior (V1)](#10-legacystandard-search-behavior-v1)
  - [10.1. Default Behavior of "More Filters" (Attributes)](#101-default-behavior-of-more-filters-attributes)
  - [10.2. Default Behavior in Combination with Service Filters](#102-default-behavior-in-combination-with-service-filters)
- [11. Enhanced Search Behavior (V2)](#11-enhanced-search-behavior-v2)
  - [11.1. Hierarchical Logic & Boolean Operators](#111-hierarchical-logic--boolean-operators)
  - [11.2. Soft Search (Bubbling) vs. Hard Filtering](#112-soft-search-bubbling-vs-hard-filtering)
  - [11.3. User-Controlled Bias](#113-user-controlled-bias)
  - [11.4. Freshness and Vetting](#114-freshness-and-vetting)
- [12. AI Discussion Prompt](#12-ai-discussion-prompt)
<!-- /TOC -->

## 1. Big Picture Vision

Build an **Empowered Search** engine that transitions from rigid "yes/no" filtering to a flexible, user-tuned scoring system. The goal is to ensure users in high-stress situations can find the most relevant resources without encountering "no results" dead ends.

The algorithm prioritizes user choice, allowing individuals to decide what "relevance" means for their current crisis. Factors considered:

### 1.1. User-Led Prioritization

Users rank selected community focuses (e.g., BIPOC, Youth) in priority order (1 to N, where N is the number of items selected, up to 5) to "bubble" them to the top.

### 1.2. Flexible Matching

V2 introduces hierarchical boolean logic for fine-grained control:

1. **Intra-group Logic**: Users can toggle between AND/OR logic _within_ specific filter groups (e.g., Services, Attributes).
2. **Inter-group Logic**: Users can toggle between AND/OR logic _between_ the Service group and the Attribute group.

### 1.3. Distance vs. Fit

A user-controlled toggle to prioritize physical proximity or service relevance.

## 2. Phase 1 Scope

**Goal**: Establish the Weighted Relevance Scoring system, enable "LGBTQ+ Community Focus" ranking, and implement the "Update Results" workflow.

### 2.1. Scoring Factors (Phase 1)

The algorithm will score results based on the following weighted criteria:

1.  **Distance Baseline**: Finding help nearby remains the primary baseline.
2.  **Community Focus Ranking ($W_{tag}$)**: Users set a priority (1 to N) for up to 5 selected items. Rank #1 gives the highest boost. The rank range dynamically adjusts based on the number of items selected (e.g., if 3 items are selected, priority values are 1, 2, or 3).
3.  **Service Match Count**: In "Match Any" (OR) mode, organizations providing _more_ of the requested services rank higher.
4.  **Hierarchical Match Logic**: Parameters for intra-group and inter-group logic (AND/OR).
5.  **National/Remote Inclusion**: A toggle to include non-local resources, which appear at the bottom by default unless they are exceptionally high-quality matches.

> **Constraint**: Users can toggle between "Match All" (Hard Filters) and "Match Any" (Scoring-based).

## 3. UI Requirements

### 3.1. Big Picture (Future State)

The UI facilitates a two-step process: **Quick Selection** in the sidebar and **Fine-Tuning** in an Advanced Modal.

### 3.2. Phase 1 (Immediate Needs)

1.  **Sidebar Updates**:
    - Add an **"Update Results"** button to trigger the search explicitly (improving performance/stability).
    - Add a **"Tune Search Priority"** button to open the Advanced Modal.
    - **Advanced Search Toggle**: Add a toggle labeled "Advanced Search" in the upper right area to reveal advanced options across the UI without immediate route changes.
2.  **Advanced Search Modal**:
    - **Priority Ranking**: Interface for users to assign ranks (1 to N) to selected Community Focus items, where N is the number of items chosen (max 5).
    - **Inter-group Logic**: Toggle AND/OR between Service results and Attribute results.
    - **Sort Bias**: Toggle between "Closest" (Distance-heavy) and "Best Match" (Attribute-heavy).
    - **Radius Slider**: Allow expanding search up to 200 miles (Smart Default: 50 miles).

> **UI Graceful Fallback**: If no organizations match the user's priority selections within the radius, the UI will display a notification: _"Showing closest results (no priority matches found in this area)."_

### 3.3. Filter Definitions

> **Note on "More Options"**: These filters are distinct from Community Focus. They include:
>
> - **Include**: Has A Confidentiality Policy, Remote, Free of cost.
> - **Exclude**: At capacity, REQUIRES medical insurance, REQUIRES a photo ID, REQUIRES proof of age, REQUIRES proof of income, REQUIRES proof of residence, REQUIRES a referral.

> **Note on "Community Focus"**: These are sort-order priorities (e.g., Spanish Speakers, BIPOC, Youth, etc.) and are not treated as exclusionary "More Options."

## 4. Technical Architecture & Decisions

### 4.1. Side-by-Side Implementation (V2 Strategy)

- **API Isolation**: Create new endpoints (e.g., `query.searchDistanceV2.handler.ts`).
- **Component Isolation**: Create new UI versions (e.g., `SearchResultSidebarV2.tsx`).
- **Schema Evolution**: Define a new `ZSearchDistanceSchemaV2` to handle the additional user-led parameters.
- **V2 UI Entry**: The new experience will live on a versioned route (e.g., `/search/v2`). This allows stakeholders to compare results side-by-side.
- **A/B Testing & Coexistence**: V1 and V2 co-existence allows for internal A/B testing and performance benchmarking.
- **Database Backward Compatibility**: Updates to `schema.prisma` (such as adding GIN indexes) are additive and non-destructive.
- **Gradual Cutover**: Use a feature flag or internal routing to toggle versions. V2 remains "Beta" until benchmarks are met.

### 4.2. Explicit Search Trigger

- **Decision**: Search will no longer execute instantly on every toggle. Users click an **"Update Results"** button (standardizing the "View x results" button in modals).
- **UI Impact**: Sidebar and filter modals (Services, More Filters) transition to this trigger model. Clicking "Update Results" while in Advanced Mode triggers the `/search/v2` route and API.

### 4.3. Candidates and Indexing

- **Decision**: In "Match Any" mode, use "Virtual Distance Reducers" to pull relevant results toward the top.
- **National Pre-filtering**: "National" organizations are pre-filtered into a temporary candidate set before scoring to optimize calculations.
- **Performance Index**: Implement **GIN Indexes** on attribute and service arrays via DB migration for near-instant lookups.

### 4.4. Performance Safeguard

- **Decision**: Even in "Match Any" mode, the database only scores organizations that match at least one selected service/attribute within the search radius to avoid full-table scans.

### 4.5. Deterministic Tie-Breaking

If relevance scores and distances are equal, the system applies the following tie-breakers:

1. **Verified Status**: Verified organizations rank higher.
2. **Rating**: Organizations with higher average ratings rank higher.
3. **Alphabetical**: Sort A-Z by organization `slug`.

### 4.6. System Tuning vs. User Control (Code-Based Config)

- **User Control**: The user defines the _relative_ importance of items.
- **Code-Based Config (Developer)**: Mathematical weights (e.g., Rank 1 = 1000 pts) are stored in `searchConfig.ts` to allow rapid tuning without migrations or admin UIs in Phase 1.

### 4.7. The "Weighting Contract" (Industry Standards)

- **Distance Baseline**: Uses a dampened reciprocal function ($1 / (1 + distance)$) to ensure proximity is a curve, not a cliff.
- **Priority Multipliers**: Uses exponential weighting (e.g., Rank 1 = 1000pts, Rank 2 = 100pts) to ensure top priorities are never "outvoted" by multiple lower priorities.
- **Verified Bonus**: Verified organizations receive a flat score boost to prioritize vetted data.

### 4.8. Toggle Mechanism

- **Manual**: Direct URL navigation between `/search` and `/search/v2`.
- **Persistence**: Choice is saved in `localStorage` (key: `ir_search_version`).
- **UI-based**: An "Advanced Search" toggle located in the results header sets an `ir_advanced_mode` parameter in `localStorage`.

### 4.9. Backend Logic (Shared Utility)

**File Location**: `packages/api/src/lib/search/relevanceScore.ts`
The utility generates a SQL `ORDER BY` fragment that balances user-defined priorities with physical distance.

## 5. Implementation Steps

### 5.1. Step 1: V2 Foundation (MVP)

1.  **Backend (Sr/Mid)**: Create `relevanceScore.ts` with user-led multipliers. Create V2 API handler.
2.  **Frontend (Mid/Jr)**: Update Sidebar with "Update" button and "Customize" modal.
3.  **Schema (Sr)**: Define V2 Zod inputs for distance defaults and sort biases.

## 6. User Experience Scenarios & Examples

### 6.1. Scenario 1: Basic Search (Default)

- **User Action**: Enters location "90210" and clicks search.
- **System Default**: 50-mile radius, "Match All" mode, "Distance" sort bias.
- **Expected Result**: A list of all nearby organizations, strictly ordered by proximity.

### 6.2. Scenario 2: Service Filtering

- **User Action**: Selects "Food Assistance".
- **System Behavior**: Filters out any organization that does not offer food.
- **Expected Result**: Closest food pantries at the top.

### 6.3. Scenario 3: Multiple Services (AND vs OR)

- **User Action**: Selects "Food Assistance" AND "Legal help".
- **"Match All" (AND) Mode**: Only orgs offering BOTH are shown.
- **"Match Any" (OR) Mode**: Orgs offering either stay on the list.
- **Bubble Effect**: In OR mode, an org offering both appears higher than an org offering only one.

### 6.4. Scenario 4: Just "More Options"

- **User Action**: Selects "Free of cost".
- **System Behavior**: Filters out any organization that is not free.
- **Expected Result**: Closest free resources at the top.

### 6.5. Scenario 5: Service + More Options (AND vs OR)

- **User Action**: Selects "Food Assistance" AND "Free of cost".
- **"Match All" (AND) Mode**: Only orgs with BOTH stay on the list.
- **"Match Any" (OR) Mode**: Orgs with either stay on the list.

### 6.6. Scenario 6: Community Focus Priority

- **User Action**: User selects "BIPOC" = **1** and "Youth" = **2**.
- **System Behavior**: "Bubbles" BIPOC-focused organizations to the very top based on priority.
- **Priority Range**: Range is 1 to N, where N is the number of items picked (max 5).

### 6.7. Scenario 7: Distance vs. Best Match

- **User Action**: User toggles from "Closest" to "Best Match".
- **System Behavior**: Virtual distance reducers become stronger.
- **Expected Result**: A highly relevant result 20 miles away may jump above a non-relevant 1-mile result.

### 6.8. Scenario 8: National vs. Local

- **User Action**: User toggles "Include National/Remote".
- **System Behavior**: Phone/online resources are added, typically appearing after local results.

### 6.9. Scenario 9: The Tie-Breaker

- **Condition**: Org A and B are 5 miles away and both match Priority #1.
- **System Behavior**: Org A is "Verified" and Org B is not.
- **Expected Result**: Org A appears first.

## 7. QA Checklist & Verification

| Feature             | Test Case                  | Expected Behavior                                                                 |
| :------------------ | :------------------------- | :-------------------------------------------------------------------------------- |
| **Isolation**       | Run V1 and V2 side-by-side | Changes in V2 settings must NOT affect V1 legacy search.                          |
| **Match All**       | Select "Legal" + "Free"    | Organizations missing either tag are hidden.                                      |
| **Match Any**       | Select "Legal" + "Free"    | Orgs with only one tag visible; orgs with both move up.                           |
| **Priority Range**  | Pick 3 focus items         | Selection tool only allows values 1, 2, and 3.                                    |
| **Bias Toggle**     | Toggle to "Best Match"     | Org matching all priorities at 30 miles moves above org matching none at 5 miles. |
| **National Toggle** | Toggle "Show National"     | Remote/National organizations appear at the end of the list.                      |
| **Performance**     | Rapid clicks in Sidebar    | Backend NOT called until "Update Results" is clicked.                             |
| **Tie-Breaking**    | Equal Score/Dist           | Order remains Verified > Rating > Slug on refresh.                                |

## 8. Analytics & Monitoring

### 8.1. Feature Discovery & Engagement

- **`advanced_search_opened`**: Frequency of users engaging with fine-tuning options.
- **`search_v2_applied`**: Usage of the "Update Results" button.
- **`priority_tags_configured`**: Usage of the 1-N ranking system.

### 8.2. Search Performance & Quality

- **`search_v2_results_summary`**: Tracking result count and search latency.
- **`zero_results_reached`**: Identifying high-friction filter combinations.

### 8.3. Conversion & Relevance (A/B Metrics)

- **`search_result_click` (Enhanced)**: Tracking click rank and search version. Success = higher % of clicks in top 3 results for V2.

### 8.4. Technical Health

- **`search_v2_error`**: Tracking failures in the SQL scoring generator or timeouts.

## 9. Strategic Recommendations

### 9.1. Internal "Search Debug" Mode

**Recommendation**: Implement a "Debug Mode" for staff/developers.

- **Visual Transparency**: Display `relevance_score` and point breakdown on result cards.
- **Sanity Checking**: Verify "Best Match" logic in real-time.

---

## 10. Legacy/Standard Search Behavior (V1)

To understand the improvements in V2, it is helpful to note the default behavior of the Legacy (V1) search engine:

### 10.1. Default Behavior of "More Filters" (Attributes)

1.  **Within the "Include" group** (e.g., "Free of cost", "Remote"): The logic is **OR**. An organization is returned if it matches _any_ of the selected "Include" attributes.
2.  **Within the "Exclude" group** (e.g., "At capacity", "Requires a photo ID"): The logic is **AND NOT**. An organization is returned if it does _not_ match _any_ of the selected "Exclude" attributes.
3.  **Between "Include" and "Exclude" groups**: The logic is **OR**. An organization is returned if it _either_ matches any of the selected "Include" attributes _or_ does not match any of the selected "Exclude" attributes.

### 10.2. Default Behavior in Combination with Service Filters

The relationship between the **Service Filter** and the **More Filter** (Attributes) is a strict **AND**. An organization must satisfy criteria from both groups to appear.

---

## 11. Enhanced Search Behavior (V2)

V2 moves from fixed logic to an **Empowered Logic** system where the user dictates the rules.

### 11.1. Hierarchical Logic & Boolean Operators

Unlike V1, V2 allows boolean relationships at three levels:

1.  **Within Services**: Toggle between **AND** or **OR**.
2.  **Within More Filters**: Toggle between **AND** or **OR**.
3.  **Between Groups**: Toggle between **AND** or **OR** (combined results of both groups).

### 11.2. Soft Search (Bubbling) vs. Hard Filtering

- **Hard Filters (Services/More Filters)**: Define the "Candidate Pool." Results that don't meet the boolean criteria are hidden.
- **Soft Sorting (Community Focus)**: Priorities (Ranked 1-N) never hide results. They generate points to "bubble" organizations to the top of the Candidate Pool.

### 11.3. User-Controlled Bias

- **Distance Bias**: Proximity is prioritized; relevance points are tie-breakers.
- **Relevance Bias**: "Virtual Distance Reducer" is amplified, allowing highly relevant results to outrank closer results.

### 11.4. Freshness and Vetting

- **Verified Bonus**: Recent verification provides a flat score boost to favor accurate data.

---

## 12. AI Discussion Prompt

_Copy the text below to start the implementation discussion:_

I am working on Phase 1 of the InReach search algorithm upgrade. We are moving from a simple distance-based sort to a Weighted Relevance Score.

**Context:**

- **Goal**: Implement the scoring logic defined in `search_relevance.md`.
- **MVP Scope**: Focus strictly on **LGBTQ+ Community Focus** sorting.
- **Constraint**: Existing filters remain hard filters, but boolean logic becomes user-controllable.
- **Architecture**: Use a shared SQL generator (`relevanceScore.ts`). Follow the Side-by-Side strategy (V2 endpoints/components).

**Files for Context:**

1. `packages/ui/components/sections/SearchResultSidebar.tsx` (Legacy Sidebar)
2. `packages/db/prisma/schema.prisma` (DB Schema)
3. `packages/api/router/organization/query.searchDistance.handler.ts` (Legacy Logic)

**Request:**
Help me implement the **V2 backend changes** for weighted relevance sorting. Create the `relevanceScore.ts` utility and the V2 API handler that integrates the hierarchical boolean logic and priority-based bubbling.
