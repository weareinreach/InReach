# InReach Search Algorithm Upgrade

<!-- TOC -->

- [1. Big Picture Vision](#1-big-picture-vision)
  - [1.1. User-Led Prioritization](#11-user-led-prioritization)
  - [1.2. Flexible Matching](#12-flexible-matching)
  - [1.3. Distance vs. Fit](#13-distance-vs-fit)
- [2. Phase 1 Scope](#2-phase-1-scope)
  - [2.1. Scoring Factors (Phase 1)](#21-scoring-factors-phase-1)
- [3. UI Requirements](#3-ui-requirements)
  - [3.1. Phase 1 (Immediate Needs)](#31-phase-1-immediate-needs)
  - [3.2. Phase 2 (Near term Needs)](#32-phase-2-near-term-needs)
  - [3.3. Phase 3 (Nice to Have Needs)](#33-phase-3-nice-to-have-needs)
- [4. Technical Architecture & Decisions](#4-technical-architecture--decisions)
  - [4.1. Side-by-Side Implementation (V2 Strategy)](#41-side-by-side-implementation-v2-strategy)
  - [4.2. Boolean Logic Defaults (V2)](#42-boolean-logic-defaults-v2)
  - [4.3. Candidates and Indexing](#43-candidates-and-indexing)
  - [4.4. Performance Safeguard](#44-performance-safeguard)
  - [4.5. Deterministic Tie-Breaking](#45-deterministic-tie-breaking)
  - [4.6. System Tuning vs. User Control (Code-Based Config)](#46-system-tuning-vs-user-control-code-based-config)
  - [4.7. The "Weighting Contract" (Industry Standards)](#47-the-weighting-contract-industry-standards)
  - [4.8. Unified Routing & Toggle Mechanism](#48-unified-routing--toggle-mechanism)
  - [4.9. Backend Logic (Shared Utility)](#49-backend-logic-shared-utility)
- [5. Implementation Steps](#5-implementation-steps)
  - [5.1. Step 1: V2 Foundation (MVP)](#51-step-1-v2-foundation-mvp)
- [6. User Experience Scenarios & Examples](#6-user-experience-scenarios--examples)
  - [6.1. Scenario 1: Basic Search (Default)](#61-scenario-1-basic-search-default)
  - [6.2. Scenario 2: Service Filtering](#62-scenario-2-service-filtering)
  - [6.3. Scenario 3: Multiple Services](#63-scenario-3-multiple-services)
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
  - [10.1. Boolean Logic Defaults (V1)](#101-boolean-logic-defaults-v1)
  - [10.2. Staged Selection & Live Count UX](#102-staged-selection--live-count-ux)
- [11. Enhanced Search Behavior (V2)](#11-enhanced-search-behavior-v2)
  - [11.1. Hierarchical Logic & Boolean Operators](#111-hierarchical-logic--boolean-operators)
  - [11.2. Soft Search (Bubbling) vs. Hard Filtering](#112-soft-search-bubbling-vs-hard-filtering)
  - [11.3. Smart Fallback (Virtual Help)](#113-smart-fallback-virtual-help)
  - [11.4. User-Controlled Bias](#114-user-controlled-bias)
  - [11.5. Freshness and Vetting](#115-freshness-and-vetting)
- [12. AI Discussion Prompt](#12-ai-discussion-prompt)
<!-- /TOC -->

## 1. Big Picture Vision

Build an **Empowered Search** engine that transitions from rigid "yes/no" filtering to a flexible, user-tuned scoring system. The goal is to ensure users in high-stress situations can find the most relevant resources without encountering "no results" dead ends.

The algorithm prioritizes user choice, allowing individuals to decide what "relevance" means for their current crisis. Factors considered:

1.  **User-Led Prioritization**: Users rank selected community focuses (e.g., BIPOC, Youth) in priority order (1 to N, where N is the number of items selected, up to 5) to "bubble" them to the top.
2.  **Flexible Matching**: The query logic will be updated to provide best guess results to ensure resources are shown even if they don't meet every single criteria.
3.  **Distance vs. Fit**: A user-controlled toggle to prioritize physical proximity or service relevance.
4.  **Distance Slider**: the query will cast a wider distance value when the results are few. The user can set a max distance.

## 2. Phase 1 Scope

**Goal**: Establish the Weighted Relevance Scoring system, enable reactive "LGBTQ+ Community Focus" ranking, and implement a unified search interface.

### 2.1. Scoring Factors (Phase 1)

The algorithm will score results based on the following weighted criteria:

1.  **Distance Baseline**: Finding help nearby remains the primary baseline.
2.  **Community Focus Ranking ($W_{tag}$)**: Users set a priority (1 to N) for up to 5 selected items. Rank #1 gives the highest boost. The rank range dynamically adjusts based on the number of items selected (e.g., if 3 items are selected, priority values are 1, 2, or 3).
3.  **Service Match Count**: In "Match Any" (OR) mode, organizations providing _more_ of the requested services rank higher.
4.  **Hierarchical Match Logic**: Parameters for intra-group and inter-group logic (AND/OR).
5.  **National/Remote Inclusion**: A toggle to include non-local resources, which appear at the bottom by default unless they are exceptionally high-quality matches.

## 3. UI Requirements

### 3.1. Phase 1 (Immediate Needs)

1.  **Sidebar Updates**:
    - Remove 'Coming Soon' mask
      - enable toggles for each option (up to 5 items)
      - enable drag and drop to set Sort order

### 3.2. Phase 2 (Near term Needs)

1.  **Search Updates**:
    - Distance Slider
      - National/Remote inclusion (Included by default)
      - Delineation line between local results and remote/national results.
      - Messaging for remote items: _"This result has been included in the search because you can access it remotely, not because we think you're located wherever the org is."_

### 3.3. Phase 3 (Nice to Have Needs)

1.  **Sort Updates**:
    - Distance vs Best Match (Best match takes into account Services + More filters)

> **Note on "More Options"**: These filters are distinct from Community Focus. They include:
>
> - **Include**: Has A Confidentiality Policy, Remote, Free of cost.
> - **Exclude**: At capacity, REQUIRES medical insurance, REQUIRES a photo ID, REQUIRES proof of age, REQUIRES proof of income, REQUIRES proof of residence, REQUIRES a referral.

> **Note on "Community Focus"**: These are sort-order priorities (e.g., Spanish Speakers, BIPOC, Youth, etc.) and are not treated as exclusionary "More Options."

## 4. Technical Architecture & Decisions

### 4.1. Side-by-Side Implementation (V2 Strategy)

- **API Isolation**: Create new endpoints (e.g., `searchDistanceV2.handler.ts`) to avoid regressions in legacy search.
- **Component Isolation**: Create new versions of UI components or new components(Advanced search toggle, SearchDistance, National/Remote checkbox)
- **A/B Testing & Coexistence**: The co-existence of V1 and V2 allows for internal A/B testing and performance benchmarking. Developers and QA can compare the "Distance-Only" vs. "Weighted Relevance" results in real-time.
- **Gradual Cutover**: A feature flag or internal routing mechanism will be used to toggle between search versions. V2 will remain in a "Beta" or "Experimental" state until quality benchmarks are met, ensuring the legacy search remains a reliable fallback.

### 4.2. Boolean Logic Defaults (V2)

- **Intra-group Logic**: Default to **OR (ANY)** within "Service Filters" and **OR (ANY)** within "More Filters".
- **Inter-group Logic**: Default to **AND** between "Service Filters" and "More Filters". (e.g., [Service A OR Service B] AND [Attribute X OR Attribute Y]).

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

- **User Control**: The user defines the _relative_ importance of items (e.g., "A is more important than B").
- **Code-Based Config (Developer)**: For Phase 1, mathematical weights (e.g., "A Priority #1 item is worth 100 points") will be stored in a centralized code file (`searchConfig.ts`).
- **Why?**: This avoids the complexity of database migrations and the need for an administrative UI in the data-portal during initial development. We can migrate these to a database table in Phase 2 if frequent tuning is required.

### 4.7. The "Weighting Contract" (Industry Standards)

To ensure consistent behavior, we apply the following mathematical standards:

- **Distance Baseline**: Uses a dampened reciprocal function ($1 / (1 + distance)$) to ensure proximity is a curve, not a cliff.
- **Priority Multipliers**: Uses exponential weighting (e.g., Rank 1 = 1000pts, Rank 2 = 100pts) to ensure top priorities are never "outvoted" by multiple lower priorities.
- **Verified Bonus**: Verified organizations receive a flat score boost to prioritize vetted data.

### 4.8. Unified Routing & Toggle Mechanism

- **Single Route Strategy**: V1 and V2 coexist on the `/search` route. The engine choice is handled via a code-level conditional based on search state.
- **Persistence**: Choice is saved in `localStorage` (key: `ir_search_version`).
- **UI-based**: An "Advanced Search" toggle sets an `ir_advanced_mode` parameter.

### 4.9. Backend Logic (Shared Utility)

**File Location**: `packages/api/src/lib/search/relevanceScore.ts`
The utility generates a SQL `ORDER BY` fragment that balances user-defined priorities with physical distance.
Advanced search remains **reactive**; results update immediately as the user adjusts community priorities or filters, matching standard search behavior.

## 5. Implementation Steps

### 5.1. Step 1: V2 Foundation (MVP)

1.  **Backend (Sr/Mid)**: Create `relevanceScore.ts` with user-led multipliers. Create V2 API handler using a `version` parameter.
2.  **Frontend (Mid/Jr)**: Update Sidebar with reactive Community Focus ranking controls.
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

### 6.3. Scenario 3: Multiple Services

- **User Action**: Selects "Food Assistance" AND "Legal help".
- **"Match Any" (OR) Mode**: Orgs offering either Food or Legal help stay on the list.
- **Bubble Effect**: In OR mode, an org offering both will appear higher than an org offering only one. With multiple orgs offering only 1, the orgs will be listed in distance order

### 6.4. Scenario 4: Just "More Options"

- **User Action**: Selects "Free of cost" (from "More filters").
- **System Behavior**: Filters out any organization that does not have at least one free resource.
- **Expected Result**: Closest free resources at the top.

### 6.5. Scenario 5: Service + More Options (AND vs OR)

- **User Action**: Selects "Food Assistance" AND "Free of cost".
- **"Match All" (AND) Mode**: the default behavior is to return only orgs with Free Food. If more than one service is selected(Like Abortion and Food Assistance) the the search will attempt to find either Free Food OR Free Abortion services.
- **Bubble Effect**: an org that has BOTH will appear higher than an org that only has one, even if the "Both" org is 2 miles further away.
- **Smart Fallback**: If the exact combination results in $\le 5$ items, a message appears: _"Do you want to find Orgs with any other Free service?"_
  - **Yes**: Runs a "smart query" (relaxing constraints to matching ANY free services).
  - **No**: User manually adjusts filters. Results are delineated: [Exact Matches] | [Smart Guess Results].

### 6.6. Scenario 6: Community Focus Priority

- **User Action**: User selects "BIPOC" and "Youth" as Community Focuses. They set "BIPOC" at the top of the list and "Youth" 2nd in the list
- **System Behavior**: The list still honors any selected Service or More Options filters, but now "bubbles" community-focused organizations to the very top based on the user's priority.
- **Priority Range**: priority range is a weighted value - which will create an internal score for ranking.

### 6.7. Scenario 7: Distance vs. Best Match

- **User Action**: User toggles from "Closest" to "Best Match".
- **System Behavior**: The math shifts focus. The "Virtual Distance Reducers" become much stronger.
- **Expected Result**: A Spanish-speaking BIPOC-focused food bank 20 miles away may now jump above a local 1-mile food bank that matches zero priorities.

### 6.8. Scenario 8: National vs. Local

- **User Action**: User toggles "Include National/Remote". On by deafult.
- **System Behavior**: Resources like "The Trevor Project" (phone/online only) are added/removed to/from the result set based on the toggle position.
- **Expected Result**: if toggled off, National will appear grouped after the local physical results unless they are a Priority #1 match.

## 7. QA Checklist & Verification

| Feature             | Test Case                   | Expected Behavior                                                                                 |
| :------------------ | :-------------------------- | :------------------------------------------------------------------------------------------------ |
| **Isolation**       | Run V1 and V2 side-by-side  | Changes in V2 settings must NOT affect results on the legacy V1 search page.                      |
| **Default Sort**    | Location Only               | Result list matches pure mileage order.                                                           |
| **Intra-group OR**  | Select Service A + B        | Returns organizations matching EITHER Service A or B (OR logic).                                  |
| **Inter-group AND** | Service A + Attribute X     | Returns organizations matching [Service A] AND [Attribute X].                                     |
| **Smart Fallback**  | Low results query ($\le 5$) | Message displays asking to run smart query. Accepting displays delineated smart matches.          |
| **Priority Range**  | Pick 3 focus items          | The priority selection tool only allows values 1, 2, and 3.                                       |
| **Bubble Effect**   | Priority 1: "Spanish"       | Spanish-speaking orgs appear higher than non-Spanish orgs at similar distances.                   |
| **Bias Toggle**     | Toggle to "Best Match"      | An org matching all priorities 30 miles away should move above an org matching none 5 miles away. |
| **Remote UI**       | Default Search results      | Remote orgs appear after local results, separated by a line and the specific disclaimer text.     |
| **Fallbacks**       | Zero results found          | Smart query will run in an attempt to display a best guess result.                                |

## 8. Analytics & Monitoring

To measure the success of the Empowered Search (V2) engine, we will track the following events via the `@weareinreach/analytics` package.

### 8.1. Feature Discovery & Engagement

- **`advanced_search_toggle`**: track on/off toggle - are poeple using it?

### 8.2. Search Performance & Quality

- **`search_v2_results_summary`**: Backend efficiency and data density.
  - _Parameters_: `result_count`, `search_latency_ms`.
- **`zero_results_reached`**: Identifying high-friction filter combinations.
  - _Parameters_: `match_mode`, `radius`, `active_filter_count`.

### 8.3. Conversion & Relevance (A/B Metrics)

- **`search_result_click` (Enhanced)**: The primary metric for algorithm success.
  - _Parameters_: `rank` (list position), `search_version` ('V1' vs 'V2'), `distance_meters`, `was_national`.
  - _Success Criteria_: A higher percentage of clicks in the top 3 results for V2 compared to V1.

### 8.4. Technical Health

- **`search_v2_error`**: Tracking failures in the SQL scoring generator or database timeouts.

## 9. Strategic Recommendations

### Internal "Search Debug" Mode

**Recommendation**: Implement a "Debug Mode" accessible only to InReach staff and developers.

- **Visual Transparency**: When active, Search Result cards will display a "Relevance Overlay" showing the raw `relevance_score` and a breakdown of why it reached that score (e.g., "+50 for Priority Match", "-10 for Distance").
- **Sanity Checking**: This allows the team to verify the "Best Match" logic in real-time. If an organization 20 miles away outranks one 1 mile away, staff can immediately see the mathematical justification.
- **Tuning Feedback Loop**: This mode provides immediate visual feedback when adjusting the code-based configuration constants, ensuring the search "feel" aligns with organizational goals.

---

## 10. Legacy/Standard Search Behavior (V1)

To understand the improvements in V2, it is helpful to note the default behavior of the Legacy (V1) search engine:

### 1. Default Behavior of "More Filters" (Attributes)

1.  **Within the "Include" group** (e.g., "Free of cost", "Remote"): The logic is **OR**. An organization is returned if it matches _any_ of the selected "Include" attributes.
2.  **Within the "Exclude" group** (e.g., "At capacity", "Requires a photo ID"): The logic is **AND NOT**. An organization is returned if it does _not_ match _any_ of the selected "Exclude" attributes.
3.  **Between "Include" and "Exclude" groups**: The logic is **OR**. An organization is returned if it _either_ matches any of the selected "Include" attributes _or_ does not match any of the selected "Exclude" attributes.

### 2. Default Behavior in Combination with Service Filters

The relationship between the **Service Filter** and the **More Filter** (Attributes) is a strict **AND**. An organization must satisfy criteria from both groups to appear.

---

## 11. Enhanced Search Behavior (V2)

### 11.1. Hierarchical Logic & Boolean Operators

V2 moves to a flexible boolean model:

1.  **Within Services**: Default to **OR (ANY)**.
2.  **Within More Filters**: Default to **OR (ANY)**.
3.  **Between Groups**: Default to **AND**.

### 11.2. Soft Search (Bubbling) vs. Hard Filtering

- **Hard Filters (Services/More Filters)**: Define the "Candidate Pool." Results that don't meet the boolean criteria are hidden.
- **Soft Sorting (Community Focus)**: Priorities (Ranked 1-N) never hide results. They generate points to "bubble" organizations to the top of the Candidate Pool.

### 11.3. Smart Fallback (Virtual Help)

If the specific combination of Service + Attribute filters results in 5 or fewer items:

1.  Display prompt: _"Do you want to find Orgs with any other Free service?"_
2.  If Yes: Execute smart query (relaxing hard filters to an OR logic across groups).
3.  Guardrails: Smart results are limited to top 10 relevance matches or a 100-mile radius to prevent result pollution. Results are visually delineated.

### 11.4. User-Controlled Bias

- **Distance Bias**: Proximity is prioritized; relevance points are tie-breakers.
- **Relevance Bias**: "Virtual Distance Reducer" is amplified, allowing highly relevant results to outrank closer results.

### 11.5. Freshness and Vetting

- **Verified Bonus**: Recent verification provides a flat score boost to favor accurate data.
