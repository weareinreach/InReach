# Search V2: File Inventory & Validation Queries

This document tracks the files involved in the Search V2 (Empowered Search) upgrade and the SQL queries required for manual validation.

## 1. File Inventory

### Backend (API & Logic)

- **New**: `packages/api/router/organization/query.searchDistanceV2.handler.ts`
  - **Purpose**: Isolated V2 search logic using weighted relevance scoring.
- **New**: `packages/api/router/organization/query.searchDistanceV2.schema.ts`
  - **Purpose**: Zod schema for V2 search inputs (priorities, bias, match mode).
- **New**: `packages/api/src/lib/search/relevanceScore.ts`
  - **Purpose**: Shared utility for generating SQL scoring fragments.
- **New**: `packages/api/src/lib/search/searchConfig.ts`
  - **Purpose**: Centralized code-based configuration for mathematical weights.

### Analytics

- **New**: `packages/analytics/src/search-v2-tracker.ts`
  - **Purpose**: Production tracking implementation for V2 search events.

### Draft Blueprints (Temporary in docs/Search/)

- **New**: `docs/Search/query.searchDistanceV2.handler.ts`
  - **Purpose**: Prototype of the tRPC handler integration.
- **New**: `docs/Search/query.searchDistanceV2.schema.ts`
  - **Purpose**: Blueprint for the V2 search input schema.
- **New**: `docs/Search/relevanceScore.ts`
  - **Purpose**: Blueprint for the SQL scoring logic.
- **New**: `docs/Search/searchConfig.ts`
  - **Purpose**: Blueprint for the engine tuning constants.
- **New**: `docs/Search/migration-v2-indexes.sql`
  - **Purpose**: SQL draft for GIN performance indexes.
- **New**: `docs/Search/v2-combined-search.sql`
  - **Purpose**: Full SQL query for manual pgAdmin validation.
- **New**: `docs/Search/SearchResultSidebarV2.tsx`
  - **Purpose**: UI blueprint for the V2 sidebar triggers.
- **New**: `docs/Search/AdvancedSearchModal.tsx`
  - **Purpose**: UI blueprint for the advanced search settings modal.
- **New**: `docs/Search/search-v2-analytics-tracker.ts`
  - **Purpose**: Prototype logic for tracking V2 user interactions.

### Frontend (UI Components)

- **New**: `packages/ui/components/sections/SearchResultSidebarV2.tsx`
  - **Purpose**: Updated sidebar for V2 search with "Update Results" and "Tune Priority" triggers.
- **New**: `packages/ui/components/sections/AdvancedSearchToggle.tsx`
  - **Purpose**: Toggle to switch between V1 and V2 search experiences.
- **New**: `packages/ui/components/modals/AdvancedSearchModal.tsx`
  - **Purpose**: Fine-tuning interface for priorities, radius, and search modes.

### Database

- **Updated**: `packages/db/prisma/schema.prisma`
  - **Purpose**: Define GIN indexes on attribute and service arrays for performance.

## 2. SQL Queries for Validation

### 2.1 Candidate Set Queries

- **Local Candidate Selection**: Verify retrieval of organizations within a specific coordinate and radius using `ST_DWithin`.
  - **Location**: `packages/api/router/organization/`
  - **File Name**: `query.searchDistanceV2.handler.ts`
  - **Handler**: `searchDistanceV2`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
- **National/Remote Candidate Selection**: Verify retrieval of organizations based on `covered_areas` (GeoData) matching the user's current location.
  - **Location**: `packages/api/router/organization/`
  - **File Name**: `query.searchDistanceV2.handler.ts`
  - **Handler**: `searchDistanceV2`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
- **GIN Index Validation**: Queries to verify that service and attribute array lookups are utilizing the new GIN indexes rather than full-table scans.
  - **Location**: `packages/api/router/organization/`
  - **File Name**: `query.searchDistanceV2.handler.ts`
  - **Handler**: `searchDistanceV2`
  - **ZSchema**: `ZSearchDistanceSchemaV2`

### 2.2 Filtering Logic Queries

- **Hard Filter (AND Mode)**: Verify that organizations are excluded if they do not match _all_ selected services and attributes.
  - **Location**: `packages/api/router/organization/`
  - **File Name**: `query.searchDistanceV2.handler.ts`
  - **Handler**: `searchDistanceV2`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
- **Soft Filter (OR Mode)**: Verify that organizations are included if they match _at least one_ selected service/attribute.
  - **Location**: `packages/api/router/organization/`
  - **File Name**: `query.searchDistanceV2.handler.ts`
  - **Handler**: `searchDistanceV2`
  - **ZSchema**: `ZSearchDistanceSchemaV2`

### 2.3 Scoring & Ranking Queries

- **Distance Decay Verification**: Verify the mathematical output of the dampened reciprocal function ($1 / (1 + distance)$) for organizations at varying distances.
  - **Location**: `packages/api/src/lib/search/`
  - **File Name**: `relevanceScore.ts`
  - **Handler**: `buildRelevanceSortSql`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
- **Service Match Boosting**: Verify that organizations with a higher count of matching services receive the correct score boost in "Match Any" mode.
  - **Location**: `packages/api/src/lib/search/`
  - **File Name**: `relevanceScore.ts`
  - **Handler**: `buildRelevanceSortSql`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
- **Priority Priority Multiplier**: Verify that Priority #1 matches receive an exponential boost compared to Priority #2-5 matches.
  - **Location**: `packages/api/src/lib/search/`
  - **File Name**: `relevanceScore.ts`
  - **Handler**: `buildRelevanceSortSql`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
- **Verified Status Bonus**: Verify the flat score boost applied to verified organizations.
  - **Location**: `packages/api/src/lib/search/`
  - **File Name**: `relevanceScore.ts`
  - **Handler**: `buildRelevanceSortSql`
  - **ZSchema**: `ZSearchDistanceSchemaV2`

### 2.4 Final Result Validation Queries

- **Combined Relevance Query**: The full "V2" query combining distance, service matching, priority multipliers, and bias toggles.
  - **Location**: `packages/api/router/organization/`
  - **File Name**: `query.searchDistanceV2.handler.ts`
  - **Handler**: `searchDistanceV2`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
- **Deterministic Tie-Breaking**: Verify that organizations with identical scores are sorted consistently by Verified Status, then Rating, then Slug.
  - **Location**: `packages/api/router/organization/`
  - **File Name**: `query.searchDistanceV2.handler.ts`
  - **Handler**: `searchDistanceV2`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
- **Empty Priority Fallback**: Verify that the query defaults to pure distance sorting when no priority matches are found in the radius.
  - **Location**: `packages/api/router/organization/`
  - **File Name**: `query.searchDistanceV2.handler.ts`
  - **Handler**: `searchDistanceV2`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
- **National Results Positioning**: Verify that national organizations appear at the end of the results unless pulled up by a high priority match.
  - **Location**: `packages/api/router/organization/`
  - **File Name**: `query.searchDistanceV2.handler.ts`
  - **Handler**: `searchDistanceV2`
  - **ZSchema**: `ZSearchDistanceSchemaV2`
