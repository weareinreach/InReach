# InReach Search Algorithm Upgrade

<!-- TOC -->

- [1. Big Picture Vision](#1-big-picture-vision)
- [2. Phase 1 Scope](#2-phase-1-scope)
  - [2.1. Scoring Factors (Phase 1)](#21-scoring-factors-phase-1)
- [3. UI Requirements](#3-ui-requirements)
  - [3.1. Big Picture (Future State)](#31-big-picture-future-state)
  - [3.2. Phase 1 (Immediate Needs)](#32-phase-1-immediate-needs)
- [4. Technical Architecture & Decisions](#4-technical-architecture--decisions)
  - [4.1. Side-by-Side Implementation (V2 Strategy)](#41-side-by-side-implementation-v2-strategy)
  - [4.2. Explicit Search Trigger](#42-explicit-search-trigger)
  - [4.3. Scoring over Filtering](#43-scoring-over-filtering)
  - [4.4. Performance Safeguard](#44-performance-safeguard)
  - [4.5. System Tuning vs. User Control (Code-Based Config)](#45-system-tuning-vs-user-control-code-based-config)
  - [4.6. Backend Logic (Shared Utility)](#46-backend-logic-shared-utility)
- [5. Implementation Steps](#5-implementation-steps)
  - [5.1. Step 1: V2 Foundation (MVP)](#51-step-1-v2-foundation-mvp)
- [6. User Experience Scenarios & Examples](#6-user-experience-scenarios--examples)
- [7. QA Checklist & Verification](#7-qa-checklist--verification)
- [8. Analytics & Monitoring](#8-analytics--monitoring)
- [9. Strategic Recommendations](#9-strategic-recommendations)
- [10. AI Discussion Prompt](#10-ai-discussion-prompt)
<!-- /TOC -->

## 1. Big Picture Vision

Build an **Empowered Search** engine that transitions from rigid "yes/no" filtering to a flexible, user-tuned scoring system. The goal is to ensure users in high-stress situations can find the most relevant resources without encountering "no results" dead ends.

The algorithm prioritizes user choice, allowing individuals to decide what "relevance" means for their current crisis. Factors considered:

1.  **User-Led Prioritization**: Users rank selected community focuses (e.g., BIPOC, Youth) in priority order (1 to N, where N is the number of items selected, up to 5) to "bubble" them to the top.
2.  **Flexible Matching**: "Match Any" (OR) logic to ensure resources are shown even if they don't meet every single criteria.
3.  **Distance vs. Fit**: A user-controlled toggle to prioritize physical proximity or service relevance.

## 2. Phase 1 Scope

**Goal**: Establish the Weighted Relevance Scoring system, enable "LGBTQ+ Community Focus" ranking, and implement the "Update Results" workflow.

### 2.1. Scoring Factors (Phase 1)

The algorithm will score results based on the following weighted criteria:

1.  **Distance Baseline**: Finding help nearby remains the primary baseline.
2.  **Community Focus Ranking ($W_{tag}$)**: Users set a priority (1 to N) for up to 5 selected items. Rank #1 gives the highest boost. The rank range dynamically adjusts based on the number of items selected (e.g., if 3 items are selected, priority values are 1, 2, or 3).
3.  **Service Match Count**: In "Match Any" (OR) mode, organizations providing _more_ of the requested services rank higher.
4.  **National/Remote Inclusion**: A toggle to include non-local resources, which appear at the bottom by default unless they are exceptionally high-quality matches.

> **Constraint**: Users can toggle between "Match All" (Hard Filters) and "Match Any" (Scoring-based).

## 3. UI Requirements

### 3.1. Big Picture (Future State)

The UI facilitates a two-step process: **Quick Selection** in the sidebar and **Fine-Tuning** in an Advanced Modal.

### 3.2. Phase 1 (Immediate Needs)

1.  **Sidebar Updates**:
    - Add an **"Update Results"** button to trigger the search explicitly (improving performance/stability).
    - Add a **"Customize Search"** button to open the Advanced Modal.
2.  **Advanced Search Modal**:
    - **Priority Ranking**: Interface for users to assign ranks (1 to N) to selected Community Focus items, where N is the number of items chosen (max 5).
    - **Scope Toggles**: "Include National/Remote" and "Match All vs. Match Any".
    - **Sort Bias**: Toggle between "Closest" (Distance-heavy) and "Best Match" (Attribute-heavy).

> **Note on "More Options"**: These filters are distinct from Community Focus. They include:
>
> - **Include**: Has A Confidentiality Policy, Remote, Free of cost.
> - **Exclude**: At capacity, REQUIRES medical insurance, REQUIRES a photo ID, REQUIRES proof of age, REQUIRES proof of income, REQUIRES proof of residence, REQUIRES a referral.

> **Note on "Community Focus"**: These are sort-order priorities (e.g., Spanish Speakers, BIPOC, Youth, etc.) and are not treated as exclusionary "More Options."

## 4. Technical Architecture & Decisions

### 4.1. Side-by-Side Implementation (V2 Strategy)

- **API Isolation**: Create new endpoints (e.g., `searchDistanceV2.handler.ts`) to avoid regressions in legacy search.
- **Component Isolation**: Create new versions of UI components (e.g., `SearchResultSidebarV2.tsx`, `AdvancedSearchModal.tsx`).
- **Schema Evolution**: Define a new `ZSearchDistanceSchemaV2` to handle the additional user-led parameters.
- **A/B Testing & Coexistence**: The co-existence of V1 and V2 allows for internal A/B testing and performance benchmarking. Developers and QA can compare the "Distance-Only" vs. "Weighted Relevance" results in real-time.
- **Gradual Cutover**: A feature flag or internal routing mechanism will be used to toggle between search versions. V2 will remain in a "Beta" or "Experimental" state until quality benchmarks are met, ensuring the legacy search remains a reliable fallback.

### 4.2. Explicit Search Trigger

- **Decision**: Search will no longer execute instantly on every toggle. Users click an **"Update Results"** button. This preserves backend performance and provides a more stable experience for users in high-stress situations.

### 4.3. Scoring over Filtering

- **Decision**: In "Match Any" mode, we use "Virtual Distance Reducers." A high match count or focus rank makes an organization "feel" closer to the user in the sort order, pulling it toward the top without physically changing its distance.

### 4.4. Performance Safeguard

- **Decision**: Even in "Match Any" mode, the database will only score organizations that match at least one selected service/attribute within the search radius. This avoids full-table scans.

### 4.5. System Tuning vs. User Control (Code-Based Config)

- **User Control**: The user defines the _relative_ importance of items (e.g., "A is more important than B").
- **Code-Based Config (Developer)**: For Phase 1, mathematical weights (e.g., "A Priority #1 item is worth 100 points") will be stored in a centralized code file (`searchConfig.ts`).
- **Why?**: This avoids the complexity of database migrations and the need for an administrative UI in the data-portal during initial development. We can migrate these to a database table in Phase 2 if frequent tuning is required.

### 4.6. Backend Logic (Shared Utility)

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
- **Expected Result**: A list of all nearby organizations, strictly ordered by proximity (closest at top).

### 6.2. Scenario 2: Service Filtering

- **User Action**: Selects "Food Assistance".
- **System Behavior**: Filters out any organization that does not offer food.
- **Expected Result**: Closest food pantries at the top.

### 6.3. Scenario 3: Multiple Services (AND vs OR)

- **User Action**: Selects "Food Assistance" AND "Legal help".
- **"Match All" (AND) Mode**: Only orgs offering BOTH Food and Legal help are shown.
- **"Match Any" (OR) Mode**: Orgs offering either Food or Legal help stay on the list.
- **Bubble Effect**: In OR mode, an org offering both will appear higher than an org offering only one.

### 6.4. Scenario 4: Just "More Options"

- **User Action**: Selects "Free of cost" (from "More filters").
- **System Behavior**: Filters out any organization that is not free.
- **Expected Result**: Closest free resources at the top.

### 6.5. Scenario 5: Service + More Options (AND vs OR)

- **User Action**: Selects "Food Assistance" AND "Free of cost".
- **"Match All" (AND) Mode**: Only orgs with BOTH "Food" and "Free" are shown.
- **"Match Any" (OR) Mode**: Orgs with either "Food" or "Free" stay on the list.
- **Bubble Effect**: In OR mode, an org that has BOTH will appear higher than an org that only has one, even if the "Both" org is 2 miles further away.

### 6.6. Scenario 6: Community Focus Priority

- **User Action**: User selects "BIPOC" and "Youth" as Community Focuses. They set "BIPOC" = **1** and "Youth" = **2**.
- **System Behavior**: The list still honors any selected Service or More Options filters, but now "bubbles" BIPOC-focused organizations to the very top based on the user's priority.
- **Priority Range**: Since 2 items are picked, priority is 1-2. If 5 items are picked, priority is 1-5.

### 6.7. Scenario 7: Distance vs. Best Match

- **User Action**: User toggles from "Closest" to "Best Match".
- **System Behavior**: The math shifts focus. The "Virtual Distance Reducers" become much stronger.
- **Expected Result**: A Spanish-speaking BIPOC-focused food bank 20 miles away may now jump above a local 1-mile food bank that matches zero priorities.

### 6.8. Scenario 8: National vs. Local

- **User Action**: User toggles "Include National/Remote".
- **System Behavior**: Resources like "The Trevor Project" (phone/online only) are added to the result set.
- **Expected Result**: These appear grouped after the local physical results unless they are a Priority #1 match.

## 7. QA Checklist & Verification

| Feature             | Test Case                  | Expected Behavior                                                                                 |
| :------------------ | :------------------------- | :------------------------------------------------------------------------------------------------ |
| **Isolation**       | Run V1 and V2 side-by-side | Changes in V2 settings must NOT affect results on the legacy V1 search page.                      |
| **Default Sort**    | Location Only              | Result list matches pure mileage order.                                                           |
| **Match All**       | Select "Legal" + "Free"    | Organizations missing either tag are completely hidden.                                           |
| **Match Any**       | Select "Legal" + "Free"    | Orgs with only one tag are still visible; orgs with both move up the list.                        |
| **Priority Range**  | Pick 3 focus items         | The priority selection tool only allows values 1, 2, and 3.                                       |
| **Bubble Effect**   | Priority 1: "Spanish"      | Spanish-speaking orgs appear higher than non-Spanish orgs at similar distances.                   |
| **Bias Toggle**     | Toggle to "Best Match"     | An org matching all priorities 30 miles away should move above an org matching none 5 miles away. |
| **National Toggle** | Toggle "Show National"     | Verify that Remote/National-only organizations appear at the bottom of the list.                  |
| **Performance**     | Rapid clicks in Sidebar    | The backend should NOT be called until the "Update Results" button is clicked.                    |
| **Fallbacks**       | Zero results found         | If "Match All" returns 0, UI suggests switching to "Match Any" or widening distance.              |

## 8. Analytics & Monitoring

To measure the success of the Empowered Search (V2) engine, we will track the following events via the `@weareinreach/analytics` package.

### 1. Feature Discovery & Engagement

- **`advanced_search_opened`**: Frequency of users engaging with fine-tuning options.
- **`search_v2_applied`**: Usage of the "Update Results" button.
  - _Parameters_: `match_mode` (AND/OR), `sort_bias` (Distance/Relevance), `include_national` (Boolean).
- **`priority_tags_configured`**: Usage of the 1-N ranking system.
  - _Parameters_: `tag_count`, `top_priority_tag`.

### 2. Search Performance & Quality

- **`search_v2_results_summary`**: Backend efficiency and data density.
  - _Parameters_: `result_count`, `search_latency_ms`.
- **`zero_results_reached`**: Identifying high-friction filter combinations.
  - _Parameters_: `match_mode`, `radius`, `active_filter_count`.

### 3. Conversion & Relevance (A/B Metrics)

- **`search_result_click` (Enhanced)**: The primary metric for algorithm success.
  - _Parameters_: `rank` (list position), `search_version` ('V1' vs 'V2'), `distance_meters`, `was_national`.
  - _Success Criteria_: A higher percentage of clicks in the top 3 results for V2 compared to V1.

### 4. Technical Health

- **`search_v2_error`**: Tracking failures in the SQL scoring generator or database timeouts.

## 9. Strategic Recommendations

### Internal "Search Debug" Mode

**Recommendation**: Implement a "Debug Mode" accessible only to InReach staff and developers.

- **Visual Transparency**: When active, Search Result cards will display a "Relevance Overlay" showing the raw `relevance_score` and a breakdown of why it reached that score (e.g., "+50 for Priority Match", "-10 for Distance").
- **Sanity Checking**: This allows the team to verify the "Best Match" logic in real-time. If an organization 20 miles away outranks one 1 mile away, staff can immediately see the mathematical justification.
- **Tuning Feedback Loop**: This mode provides immediate visual feedback when adjusting the code-based configuration constants, ensuring the search "feel" aligns with organizational goals.

---

## 10. AI Discussion Prompt

_Copy the text below to start the implementation discussion:_

I am working on **Phase 1 of the InReach search algorithm upgrade**. We are moving from a simple distance-based sort to a Weighted Relevance Score. This logic should be applicable to multiple search types, not just distance-based.

**Context:**

- **Goal**: Implement the scoring logic defined in `search_relevance.md`.
- **MVP Scope**: Focus strictly on **LGBTQ+ Community Focus** sorting. Ratings and Service Tags are deferred.
- **Constraint**: Existing Service and Attribute filters must remain unchanged (hard filters).
- **Architecture**: Use a shared SQL generator (`relevanceScore.ts`) for scoring. Use a central code-based config (`searchConfig.ts`) for mathematical weights to avoid DB migrations in Phase 1. Follow the **Side-by-Side** strategy (V2 endpoints/components).

**Files for Context:**
Please review the following files to understand the current state:

1.  `packages/ui/components/sections/SearchResultSidebar.tsx` (Frontend UI)
2.  `packages/db/prisma/schema.prisma` (Database Schema - _to be updated_)
3.  `packages/api/router/organization/query.searchDistance.handler.ts` (Legacy Search Logic - _reference for V2 creation_)

**Request:**

- Help me implement the **V2 backend changes** for weighted relevance sorting.

1.  **Shared SQL Utility**: Create the reusable SQL fragment generator (`relevanceScore.ts`) for the weighted sort. It must handle:
    - Distance Decay.
    - Community Focus Tag Boosting (`priorityTags`).
    - _Note: Do not implement Ratings or Service Tag matching yet._
2.  **V2 Handler**: Create `query.searchDistanceV2.handler.ts` and its corresponding schema, integrating the new scoring logic while maintaining the legacy logic in the V1 handler.
