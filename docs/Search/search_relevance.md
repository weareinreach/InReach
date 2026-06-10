# InReach Search Algorithm Upgrade

<!-- TOC -->

- [1. Big Picture Vision](#1-big-picture-vision)
- [2. Phase 1 Scope](#2-phase-1-scope)
  - [2.1. Scoring Factors (Phase 1)](#21-scoring-factors-phase-1)
- [3. UI Requirements](#3-ui-requirements)
  - [3.1. Phase 1 (Immediate Needs)](#31-phase-1-immediate-needs)
  - [3.2. Phase 2 (Nice to Have)](#32-phase-2-nice-to-have)
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
  - [6.7. Scenario 7: Distance vs. Best Match (Not Yet Implemented)](#67-scenario-7-distance-vs-best-match-not-yet-implemented)
  - [6.8. Scenario 8: National vs. Local (Not Yet Implemented)](#68-scenario-8-national-vs-local-not-yet-implemented)
- [7. QA Checklist & Verification](#7-qa-checklist--verification)
  - [7.1. Stakeholder Test Cases (Advanced Search)](#71-stakeholder-test-cases-advanced-search)
  - [7.2. Nuances and Edge Cases](#72-nuances-and-edge-cases)
  - [7.3. Technical Parity Scenarios (V1 vs V2)](#73-technical-parity-scenarios-v1-vs-v2)
- [8. Analytics & Monitoring](#8-analytics--monitoring)
  - [8.1. Feature Discovery & Engagement](#81-feature-discovery--engagement)
  - [8.2. Search Performance & Quality](#82-search-performance--quality)
  - [8.3. Conversion & Relevance (A/B Metrics)](#83-conversion--relevance-ab-metrics)
  - [8.4. Technical Health](#84-technical-health)
- [9. Strategic Recommendations](#9-strategic-recommendations)
  - [Internal "Search Debug" Mode](#internal-search-debug-mode)
- [10. Legacy/Standard Search Behavior (V1)](#10-legacystandard-search-behavior-v1)
  - [1. Default Behavior of "More Filters" (Attributes)](#1-default-behavior-of-more-filters-attributes)
  - [2. Default Behavior in Combination with Service Filters](#2-default-behavior-in-combination-with-service-filters)
- [11. Enhanced Search Behavior (V2)](#11-enhanced-search-behavior-v2)
  - [11.1. Hierarchical Logic & Boolean Operators](#111-hierarchical-logic--boolean-operators)
  - [11.2. Soft Search (Bubbling) vs. Hard Filtering](#112-soft-search-bubbling-vs-hard-filtering)
  - [11.3. Smart Fallback (Virtual Help) (Not Yet Implemented)](#113-smart-fallback-virtual-help-not-yet-implemented)
  - [11.4. User-Controlled Bias (Not Yet Implemented)](#114-user-controlled-bias-not-yet-implemented)
  - [11.5. Freshness and Vetting (Not Yet Implemented)](#115-freshness-and-vetting-not-yet-implemented)
- [12. Search by Name Evolution](#12-search-by-name-evolution)
  - [12.1. Original Behavior (Legacy)](#121-original-behavior-legacy)
  - [12.2. Updated "Smart Search" Behavior](#122-updated-smart-search-behavior)
  <!-- /TOC -->

## 1. Big Picture Vision

Build an **Empowered Search** engine that transitions from rigid "yes/no" filtering to a flexible, user-tuned scoring system. The goal is to ensure users in high-stress situations can find the most relevant resources without encountering "no results" dead ends.

The algorithm prioritizes user choice, allowing individuals to decide what "relevance" means for their current crisis. Factors considered:

1.  **User-Led Prioritization**: Users rank selected community focuses (e.g., BIPOC, Youth) in priority order (1 to N, where N is the number of items selected, up to 5) to "bubble" them to the top.
2.  **Flexible Matching**: The query logic will be updated to provide best guess results to ensure resources are shown even if they don't meet every single criteria.
3.  **Distance vs. Fit**: A user-controlled toggle to prioritize physical proximity or service relevance.
4.  **Distance Slider**: The query will cast a wider distance value when the results are few. The user can set a max distance.

## 2. Phase 1 Scope

**Goal**: Establish the Weighted Relevance Scoring system, enable reactive "LGBTQ+ Community Focus" ranking, and implement a unified search interface.

### 2.1. Scoring Factors (Phase 1)

The algorithm will score results based on the following weighted criteria:

1.  **Distance Baseline**: Finding help nearby remains the primary baseline.
2.  **Community Focus Ranking ($W_{tag}$)**: Users set a priority (1 to N) for up to 5 selected items. Rank #1 gives the highest boost. The rank range dynamically adjusts based on the number of items selected (e.g., if 3 items are selected, priority values are 1, 2, or 3).
3.  **Service Match Count (Not Yet Implemented)**: In "Match Any" (OR) mode, organizations providing _more_ of the requested services rank higher.
4.  **Hierarchical Match Logic**: Parameters for intra-group and inter-group logic (AND/OR).
5.  **National/Remote Inclusion**: A toggle to include non-local resources, which appear at the bottom by default unless they are exceptionally high-quality matches.

## 3. UI Requirements

### 3.1. Phase 1 (Immediate Needs)

1.  **Results page updates**:
    - Add toggle to enable Advanced search
      - when turned off - standard search will be used
      - when turned on - advanced search will be used
2.  **Sidebar Updates**:
    - Remove 'Coming Soon' mask
      - enable toggles for each option (up to 5 items)
      - enable drag and drop to set Sort order
3.  **List Results Updates**:
    - Delineate results based on distance to search location
      - create 5 zones
        - NEIGHBORHOOD: 'Neighborhood Resources (<= 10 miles)'
        - LOCAL: 'Local Resources (11 - 25 miles)'
        - REGION: 'Regional Resources (26 - 50 miles)'
        - EXTENDED_REGION: 'Extended Region Resources (51 - 200 miles)'
        - NATIONAL: 'The items below match your filters but are remote/national resources available to you regardless of your physical location.'
    - Bubble results within zones based on community toggles

### 3.2. Phase 2 (Nice to Have)

1.  **Search Updates**:

    - Distance Slider
      - National/Remote inclusion (Included by default)
      - Delineation line between local results and remote/national results.
      - Messaging for remote items: _"This result has been included in the search because you can access it remotely, not because we think you're located wherever the org is."_

2.  **Sort Updates**:
    - Distance vs Best Match (Best match takes into account Services + More filters)

> **Note on "More Options"**: These filters are distinct from Community Focus. They include:
>
> - **Include**: Has A Confidentiality Policy, Remote, Free of cost.
> - **Exclude**: At capacity, REQUIRES medical insurance, REQUIRES a photo ID, REQUIRES proof of age, REQUIRES proof of income, REQUIRES proof of residence, REQUIRES a referral.

> **Note on "Community Focus"**: These are sort-order priorities (e.g., Spanish Speakers, BIPOC, Youth, etc.) and are not treated as exclusionary "More Options."

## 4. Technical Architecture & Decisions

### 4.1. Side-by-Side Implementation (V2 Strategy)

- **API Isolation**: Create new endpoints (e.g., `searchDistanceV2.handler.ts`) to avoid regressions in legacy search.
- **Advanced Search Toggle**: the new search will be used when the Advanced search toggle is enabled

### 4.2. Boolean Logic Defaults (V2)

This is the current search behavior and will not change with advanced search:

- **Intra-group Logic**: Default to **(ANY)** within "Service Filters" and **(ANY)** within "More Filters".
- **Inter-group Logic**: Default to **AND** between "Service Filters" and "More Filters". (e.g., [Service A OR Service B] AND [Attribute X OR Attribute Y]).

### 4.3. Candidates and Indexing

- **Decision**: In "Match Any" mode, use "Virtual Distance Reducers" to pull relevant results toward the top.
- **National Pre-filtering**: "National" organizations are pre-filtered into a temporary candidate set before scoring to optimize calculations.
- **Performance Index**: Implement **GIN Indexes** on attribute and service arrays via DB migration for near-instant lookups.

### 4.4. Performance Safeguard

- **Decision**: Even in "Match Any" mode, the database only scores organizations that match at least one selected service/attribute within the search radius to avoid full-table scans.

### 4.5. Deterministic Tie-Breaking

If relevance scores and distances are equal, the system ensures a stable sort order.

1. **Alphabetical (Implemented)**: Sort A-Z by organization `slug`.
2. **Verified Status (To be implemented)**: Verified organizations rank higher.
3. **Rating (To be implemented)**: Organizations with higher average ratings rank higher.

### 4.6. System Tuning vs. User Control (Code-Based Config)

- **User Control**: The user defines the _relative_ importance of items (e.g., "A is more important than B").
- **Code-Based Config (Developer)**: For Phase 1, mathematical weights (e.g., "A Priority #1 item is worth 100 points") will be stored in a centralized code file (`searchConfig.ts`).
- **Why?**: This avoids the complexity of database migrations and the need for an administrative UI in the data-portal during initial development. We can migrate these to a database table in Phase 2 if frequent tuning is required.

### 4.7. The "Weighting Contract" (Industry Standards)

To ensure consistent behavior, we apply the following mathematical standards:

- **Distance Baseline**: Uses a dampened reciprocal function ($1 / (1 + distance)$) to ensure proximity is a curve, not a cliff.
- **Priority Multipliers**: Uses exponential weighting (e.g., Rank 1 = 1000pts, Rank 2 = 100pts) to ensure top priorities are never "outvoted" by multiple lower priorities.
- **Verified Bonus (To be implemented)**: Verified organizations receive a flat score boost to prioritize vetted data.

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
- **System Default**: 200-mile radius, "Match All" mode, "Distance" sort bias.
- **Expected Result**: A list of all nearby organizations, strictly ordered by proximity (closest at top).

### 6.2. Scenario 2: Service Filtering

- **User Action**: Selects "Food Assistance".
- **System Behavior**: Filters out any organization that does not offer food.
- **Expected Result**: Closest food pantries at the top.

### 6.3. Scenario 3: Multiple Services

- **User Action**: Selects "Food Assistance" AND "Legal help".
- **"Match Any" Mode**: Orgs offering either Food or Legal help stay on the list.
- **Bubble Effect**: In ANY mode, an org offering both will appear higher than an org offering only one. With multiple orgs offering only 1, the orgs will be listed in distance order

### 6.4. Scenario 4: Just "More Options"

- **User Action**: Selects "Free of cost" (from "More filters").
- **System Behavior**: Filters out any organization that does not have at least one free resource.
- **Expected Result**: Closest free resources at the top.

### 6.5. Scenario 5: Service + More Options (AND vs OR)

- **User Action**: Selects "Food Assistance" AND "Free of cost".
- **"Match All" (ANY) Mode**: The default behavior is to return only orgs with Free Food. If more than one service is selected (Like Abortion and Food Assistance) then the search will attempt to find either Free Food OR Free Abortion services.
- **Bubble Effect**: An org that has BOTH will appear higher than an org that only has one, even if the "Both" org is 2 miles further away.
- **Smart Fallback**: If the exact combination results in $\le 5$ items, a message appears: _"Do you want to find Orgs with any other Free service?"_ (not yet implemented)
  - **Yes**: Runs a "smart query" (relaxing constraints to matching ANY free services).
  - **No**: User manually adjusts filters. Results are delineated: [Exact Matches] | [Smart Guess Results].

### 6.6. Scenario 6: Community Focus Priority

- **User Action**: User selects "BIPOC" and "Youth" as Community Focuses. They set "BIPOC" at the top of the list and "Youth" 2nd in the list
- **System Behavior**: The list still honors any selected Service or More Options filters, but now "bubbles" community-focused organizations to the very top based on the user's priority.
- **Priority Range**: priority range is a weighted value - which will create an internal score for ranking.

### 6.7. Scenario 7: Distance vs. Best Match (Not Yet Implemented)

- **User Action**: User toggles from "Closest" to "Best Match".
- **System Behavior**: The math shifts focus. The "Virtual Distance Reducers" become much stronger.
- **Expected Result**: A Spanish-speaking BIPOC-focused food bank 20 miles away may now jump above a local 1-mile food bank that matches zero priorities.

### 6.8. Scenario 8: National vs. Local (Not Yet Implemented)

National appears at the bottom of the list by default.

- **User Action**: User toggles "Include National/Remote". On by default.
- **System Behavior**: Resources like "The Trevor Project" (phone/online only) are added/removed to/from the result set based on the toggle position.
- **Expected Result**: If toggled off, National will appear grouped after the local physical results unless they are a Priority #1 match.

## 7. QA Checklist & Verification

### 7.1. Quick Verification Table

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

### 7.2. Stakeholder Test Cases (Advanced Search)

#### A. The "Clean Slate" Test (Strict Parity)

- **Input**: Search any location with **Advanced Search ON** but **NO** Community Focuses selected.
- **Expected**: The list should look identical to the Standard Search. It should be a simple list of resources ordered by distance (closest first).

#### B. The "Neighborhood Hero" Test (Bubbling)

- **Input**: Search a location where you know there is a specialized resource (e.g., a BIPOC-focused pantry 8 miles away) and a closer generic resource (e.g., a generic pantry 2 miles away). Toggle **"BIPOC"** focus.
- **Expected**: Both are in the **Neighborhood** bucket. The BIPOC resource should jump to #1, even though it is 6 miles further than the other.

#### C. The "Bucket Guardrail" Test (Tier Protection)

- **Input**: Search a location. Select **"Youth"** focus.
- **Find**: A Youth match that is 30 miles away (**Region** bucket) vs. a generic resource that is 5 miles away (**Neighborhood** bucket).
- **Expected**: The 5-mile resource must stay above the 30-mile resource. The identity match is not powerful enough to cross bucket boundaries.

#### D. The "Tie-Breaker" Test (Alphabetical)

- **Input**: Two organizations at the same physical address (e.g., a community hub at 0 miles).
- **Expected**: The results should always appear in the same alphabetical order every time you refresh.

### 7.3. Nuances and Edge Cases

1.  **The "Borderline" Result**: A resource at 10.1 miles is technically in the **Local** bucket, while one at 9.9 miles is in the **Neighborhood** bucket. The 9.9-mile resource will always appear first regardless of relevance.
2.  **Administrative Offices (False Positives)**: Some national organizations have one administrative office (e.g., in San Francisco). If a user searches in San Francisco, that National org might appear as "Neighborhood" help because it has a desk nearby.
3.  **"Remote" but physically close**: An organization might be physically 2 miles away but is only offering virtual/phone help for your specific search. These are grouped in the **National/Remote** bucket at the bottom.
4.  **"Extended Region" vs. "Out of Range"**: Anything beyond 200 miles is excluded from the physical tiers and will only appear in the **National/Remote** section.

### 7.4. Technical Parity Scenarios (V1 vs V2)

**Goal**: Verify that Standard Search (V1) and Advanced Search (V2) return identical results in the same order when no community focus sorting is active.

1.  **Basic Location Search**
    - **Input**: Location: "New Almaden, CA"; Toggle: ON (no focuses).
    - **Expected**: Identical result count and distance-based ordering as V1.
2.  **Single Service Filter**
    - **Input**: "Abortion Care"; Toggle: ON (no focuses).
    - **Expected**: Identical result set as V1.
3.  **Multiple Service Filters (OR Logic)**
    - **Input**: "Abortion Care", "Mental Health"; Toggle: ON (no focuses).
    - **Expected**: Identical result set as V1.
4.  **Single "More Filter" (Include)**
    - **Input**: "Free of Cost" (Include); Toggle: ON (no focuses).
    - **Expected**: Identical result set as V1.
5.  **Combination (AND Logic)**
    - **Input**: "Abortion Care" AND "Free of Cost"; Toggle: ON (no focuses).
    - **Expected**: Identical result set as V1.
6.  **National/Remote Results**
    - **Input**: Remote location (e.g., Alaska); "Abortion Care".
    - **Expected**: National orgs appear after local results (if any), sorted by distance within respective groups.
7.  **No Results Found**
    - **Input**: "Crisis Intervention" AND "Requires Photo ID" (Exclude).
    - **Expected**: Both searches return 0 results.

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

### 11.3. Smart Fallback (Virtual Help) (Not Yet Implemented)

If the specific combination of Service + Attribute filters results in 5 or fewer items:

1.  Display prompt: _"Do you want to find Orgs with any other Free service?"_
2.  If Yes: Execute smart query (relaxing hard filters to an OR logic across groups).
3.  Guardrails: Smart results are limited to top 10 relevance matches or a 100-mile radius to prevent result pollution. Results are visually delineated.

### 11.4. User-Controlled Bias (Not Yet Implemented)

- **Distance Bias**: Proximity is prioritized; relevance points are tie-breakers.
- **Relevance Bias**: "Virtual Distance Reducer" is amplified, allowing highly relevant results to outrank closer results.

### 11.5. Freshness and Vetting (Not Yet Implemented)

- **Verified Bonus**: Recent verification provides a flat score boost to favor accurate data.

## 12. Search by Name Evolution

While distance-based search is the primary way seekers find local help, the "Search by Name" feature is critical for users who know exactly which organization they need.

### 12.1. Original Behavior (Legacy)

The original implementation relied on standard database substring matching (`ILIKE`):

- **Mechanism**: `where: { name: { contains: searchTerm, mode: 'insensitive' } }`.
- **Strengths**: Fast and predictable for exact matches.
- **Weaknesses**:
  - **Literal Punctuation**: Searching for "St Johns" would fail to find "St. John's" because of the period and apostrophe.
  - **Typos**: A single transposed letter (e.g., "Queer Helplien") resulted in zero matches.
  - **No Semantic Understanding**: No relationship between "St" and "Saint" or "+" and "Plus".
  - **Client-Side Over-filtering**: The frontend often applied a second layer of strict substring matching, further hiding valid server results.

### 12.2. Updated "Smart Search" Behavior

The updated implementation uses PostgreSQL's advanced text processing extensions to provide a much more forgiving "Google-like" experience.

**Key Components**:

1.  **Normalization Layer**: Both the stored name and the user's input are stripped of non-alphanumeric characters (except spaces) and converted to lowercase before comparison.
    - _Example_: "St. Louis Queer+" and "st-louis queer" both become "st louis queer".
2.  **Diacritic Insensitivity (`unaccent`)**: Ignores accents. "México" matches "Mexico".
3.  **Fuzzy Trigram Matching (`pg_trgm`)**: Breaks words into 3-character sequences to calculate a similarity score.
    - _Example_: "Helplien" maintains a high similarity to "Helpline".
4.  **Synonym Expansion (Thesaurus)**: Uses a `SearchSynonym` table to expand queries based on semantic clusters.
    - _Example_: A search for "Saint" can automatically look for "St" if defined in a cluster.
5.  **Ranked Results**: Instead of a binary "yes/no", results are ordered by a similarity `score` (0.0 to 1.0), ensuring the closest matches appear first.
6.  **Trust-the-Server UI**: Client-side filtering is disabled (`filter={() => true}`) to ensure the UI doesn't hide the "smart" matches found by the database.
7.  **Adaptive Highlighting**: The UI highlighting logic uses a regex that ignores punctuation between characters, allowing "st johns" to correctly highlight "St. John's".
