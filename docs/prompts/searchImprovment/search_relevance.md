# InReach Search Algorithm Upgrade

## 1. Big Picture Vision

Build out InReach's advanced search algorithm to ensure we are matching users to the most relevant existing resources.

InReach's search algorithm will evolve over time with more data. In the future, the algorithm will take the following factors into consideration to determine which verified providers are the most relevant:

1.  **Engagement Score**: Service providers’ organization engagement score with InReach.
2.  **Ratings**: Service providers’ ratings (1 to 5 stars) on InReach.
3.  **Bonus Points**:
    - “InReach Staff Pick”
    - “InReach Partner Pick”
4.  **Advanced Search Options**: User ability to filter by age, accessibility features, cost, etc.
5.  **LGBTQ+ Community Focus**: Ordering providers by specific community focus (e.g., BIPOC, gender nonconforming).

## 2. Phase 1 Scope

**Goal**: Establish the Weighted Relevance Scoring system and enable "LGBTQ+ Community Focus" sorting.

### Scoring Factors (Phase 1)

The algorithm will score results based on the following weighted criteria:

1.  **Location ($W_{dist}$)**: Inverse decay scoring (closer = higher score).
2.  **LGBTQ+ Community Focus ($W_{tag}$)**: Bonus points for specific tags (e.g., "BIPOC", "Transgender") selected via the new Sidebar UI.
3.  **Ratings ($W_{rating}$)**: Bayesian average calculation (Step 2).
4.  **Service Tags ($W_{service}$)**: Boost based on match count (Step 2 - _Pending logic verification_).

> **Constraint**: Existing Service and Attribute filters remain **Hard Filters** (exclusionary). The new scoring logic applies only to the sorting of the filtered result set.

## 3. UI Requirements

### Big Picture (Future State)

- **Result Cards**:
  - Display Star Ratings (1-5 stars) and review counts.
  - Badges for "Staff Pick" and "Partner Pick".
  - Visual indicators for "High Engagement" (if public-facing).
- **Search Filters**:
  - Rating filter (e.g., "4+ Stars").
  - Advanced filters for Age, Accessibility, Cost, Insurance.
  - "Staff/Partner Pick" toggle.
- **Sorting**:
  - Dropdown to sort by: Relevance, Distance, Highest Rated, Most Reviewed.

### Phase 1 (Immediate Needs)

- **Sidebar (`SearchResultSidebar.tsx`)**:
  - **Community Focus Toggles**: Enable the "Sort by LGBTQ+ focus" switches (BIPOC, Transgender, etc.).
- **Result Cards**:
  - **Ratings**: Populate the existing rating/review UI slots with the new `avgRating` and `reviewCount` fields.
  - **Relevance Indicators**: _Not required for Phase 1. The existing UI already displays matching services and attributes, which provides sufficient context to the user._

## 4. Technical Architecture & Decisions

### 1. Data Consistency

- **Decision**: Use PostgreSQL Triggers to ensure `avgRating` and `reviewCount` on the `Organization` model stay in sync with the `OrgReview` table. This avoids application-level drift.

### 2. Score Normalization

- **Decision**: Implement normalization logic within a shared/reusable library function (e.g., `packages/api/src/lib/search/relevanceScore.ts`). This ensures consistent math across different search handlers.

### 3. Tag Mapping

- **Decision**: UI toggles in the sidebar correspond to specific `Attribute` records. The backend will map these toggles to the underlying `Attribute` tags (via `AttributeSupplement`) to calculate boosts.

### 4. Global Search & Performance

- **Constraint**: The system does **not** support global search; a location (City, State, or Country) is always required.
- **Decision**: We can safely rely on the geospatial radius filter to limit the dataset size before calculating relevance scores.

### 5. Configuration & Caching

- **Decision**: Store search weights and Bayesian constants (`m`, `C`) in a `SearchConfig` table.
- **Caching Strategy**: To ensure weight changes are reflected on the **immediate next call**, we will fetch the configuration from the database on every search request. Given the table size (likely 1 row), the performance overhead is negligible compared to the search query itself.

### 6. Tag Maintenance (Code vs. Config)

- **Limitation**: The system currently requires code changes to introduce _new_ "Community Focus" tags (updating the UI sidebar and the backend `PRIORITY_TAG_MAP`).
- **Workflow**: To add a new tag:
  1.  **Developer**: Adds the new tag to `SearchResultSidebar.tsx` and `relevanceScore.ts`. Deploys code.
  2.  **Admin**: Assigns the new attribute to Organizations in the database.
  3.  **Admin**: Tunes the weight of the new tag in `SearchConfig` (no code required).

### Database Schema

- **Organization Model**:
  - `avgRating` (Float): Denormalized average rating (updated via triggers).
  - `reviewCount` (Int): Denormalized review count (updated via triggers).
- **SearchConfig Model**:
  - `key` (String, unique): Config identifier (e.g., 'default').
  - `weights` (Json): Dynamic weights (e.g., `{ dist: 1.0, rating: 0.5, tag: 2.0, service: 1.0 }`).
  - `m` (Float): Bayesian minimum votes constant (default: 5.0).
  - `C` (Float): Bayesian global average constant (default: 3.5).

### Backend Logic (Shared Utility)

**File**: `packages/api/src/lib/search/relevanceScore.ts`

The utility generates a SQL `ORDER BY` fragment.

- Formula Concept:
  $$ Score = \frac{W*{dist}}{distance} + (W*{rating} \times BayesianRating) + (W*{tag} \times CommunityFocusMatch) + (W*{service} \times ServiceMatchCount) $$

## 5. Implementation Steps

### Step 1: LGBTQ+ Focus (MVP)

- **Task 1.1: Frontend Sidebar** (Assigned: Jr/Intern)
  - Modify `SearchResultSidebar.tsx`.
    - \*\*Remove "Coming Soon" overlay.
  - Wire up state for "Community Focus" toggles:
    - **State Tracking**: Create a variable (e.g., `priorityTags`) in the parent component to track active filters.
    - **Event Handling**: Implement logic to update the list when toggles are clicked.
    - **Data Passing**: Pass selected tags to the main Search Handler to trigger re-sorts.
- **Task 1.2: Shared Scoring Utility (MVP)** (Assigned: Sr)
  - Create `relevanceScore.ts`.
  - Implement `buildRelevanceSortSql` function with **Distance Decay** and **Tag Boosting** only.
  - _Note_: Skip Bayesian math and Service Tag matching for this step.
- **Task 1.3: Search Handler Integration** (Assigned: Mid)
  - Update `query.searchDistance.handler.ts`.
  - Update TRPC input schema to accept `priorityTags`.
  - Inject the dynamic `ORDER BY` clause.

### Step 2: Ratings & Configuration (Follow-up)

- **Task 2.1: Schema Updates** (Assigned: Mid/Sr)
  - Update `schema.prisma`: Add `avgRating`, `reviewCount`, `SearchConfig`.
  - Add DB Triggers for consistency.
  - _Verification_: Confirm if Service Filters use AND vs OR logic before implementing `ServiceMatchCount`.
- **Task 2.2: Full Scoring Logic** (Assigned: Sr)
  - Update `relevanceScore.ts` to include Bayesian math and Service Tag matching.
  - Implement `SearchConfig` fetching.
- **Task 2.3: UI Wiring** (Assigned: Jr)
  - **Result Card Wiring**: Connect `avgRating` and `reviewCount` to the existing UI components.
  - Update `packages/ui/components/core/Rating.tsx` to accept `initialRating` and `initialCount` props.

### Step 3: Configuration & Data

- **Task 3.1: Configuration Seeding**
  - Seed `SearchConfig` with default weights.
- **Task 3.2: Tag Mapping Verification**
  - Verify `PRIORITY_TAG_MAP` matches DB.

### Step 4: QA & Performance

- **Task 4.1: Performance Check** (Assigned: Sr)
  - Run `EXPLAIN ANALYZE` on the new query.
  - Ensure Geospatial Index is still being used effectively before the Sort.

---

## 6. AI Discussion Prompt

_Copy the text below to start the implementation discussion:_

I am working on **Phase 1 of the InReach search algorithm upgrade**. We are moving from a simple distance-based sort to a Weighted Relevance Score. This logic should be applicable to multiple search types, not just distance-based.

**Context:**

- **Goal**: Implement the scoring logic defined in `search_relevance.md`.
- **MVP Scope**: Focus strictly on **LGBTQ+ Community Focus** sorting. Ratings and Service Tags are deferred.
- **Constraint**: Existing Service and Attribute filters must remain unchanged (hard filters).
- **Architecture**: Use a shared SQL generator (`relevanceScore.ts`) for scoring. Fetch `SearchConfig` on every request for immediate updates.

**Files for Context:**
Please review the following files to understand the current state:

1.  `packages/ui/components/sections/SearchResultSidebar.tsx` (Frontend UI)
2.  `packages/db/prisma/schema.prisma` (Database Schema - _to be updated_)
3.  `packages/api/src/router/query.searchDistance.handler.ts` (Example Search Logic - _to be updated_)

**Request:**
Help me implement the **MVP backend changes** for LGBT sorting.

1.  **Shared SQL Utility**: Create the reusable SQL fragment generator (`relevanceScore.ts`) for the weighted sort. It must handle:
    - Distance Decay.
    - Community Focus Tag Boosting (`priorityTags`).
    - _Note: Do not implement Ratings or Service Tag matching yet._
2.  **Integration**: Show how to inject this fragment into `query.searchDistance.handler.ts`.
