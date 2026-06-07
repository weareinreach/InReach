# User-Facing Search Logic Summary (Non-Technical)

## The Goal

InReach Advanced Search is designed to find the **best match** for a user's identity while respecting the **physical reality** of their situation. We prioritize help you can walk into (Local) while ensuring that organizations specifically built for your community (e.g., BIPOC or Youth focused) "bubble" to the top of their respective distance groups.

## How the Search "Thinks"

The search engine organizes results into five "buckets" based on distance. An organization in a closer bucket will **always** appear before an organization in a farther bucket, even if the farther one is a better community match.

### The 5 Proximity Buckets:

1.  **Neighborhood (<= 10 miles)**: Help in your immediate area.
2.  **Local (11 - 25 miles)**: Within a standard commuting distance.
3.  **Region (26 - 50 miles)**: Requires a purposeful trip.
4.  **Extended Region (51 - 200 miles)**: Physical help that is quite far away.
5.  **National/Remote**: Phone lines, websites, or virtual help with no physical building nearby.

## What is "Bubbling"?

Inside each of those 5 buckets, the search looks at the "Community Focus" toggles you’ve selected in the sidebar.

- If you select **"Youth"** as your #1 priority, any organization in your **Neighborhood** bucket that specializes in Youth will jump to the #1 spot in that bucket.
- However, a **Statewide** Youth organization will **never** jump over a **Neighborhood** generic organization. Proximity is the ultimate guardrail.

---

# Advanced Search Test Cases (For Stakeholders)

### A. The "Clean Slate" Test (Strict Parity)

**Input**: Search any location with **Advanced Search ON** but **NO** Community Focuses selected.
**Expected**: The list should look identical to the Standard Search. It should be a simple list of resources ordered by distance (closest first).

### B. The "Neighborhood Hero" Test (Bubbling)

**Input**: Search a location where you know there is a specialized resource (e.g., a BIPOC-focused pantry 8 miles away) and a closer generic resource (e.g., a generic pantry 2 miles away). Toggle **"BIPOC"** focus.
**Expected**: Both are in the **Neighborhood** bucket. The BIPOC resource should jump to #1, even though it is 6 miles further than the other.

### C. The "Bucket Guardrail" Test (Tier Protection)

**Input**: Search a location. Select **"Youth"** focus.

- Find a Youth match that is 30 miles away (**Region** bucket).
- Find a generic resource that is 5 miles away (**Neighborhood** bucket).
  **Expected**: The 5-mile resource must stay above the 30-mile resource. The identity match is not powerful enough to cross bucket boundaries.

### D. The "Tie-Breaker" Test (Alphabetical)

**Input**: Two organizations at the same physical address (e.g., a community hub at 0 miles).
**Expected**: The results should always appear in the same alphabetical order every time you refresh.

---

# Nuances and Edge Cases

### 1. The "Borderline" Result

**Nuance**: A resource at 10.1 miles is technically in the **Local** bucket, while one at 9.9 miles is in the **Neighborhood** bucket.
**Impact**: The 9.9-mile resource will always appear first. To the user, 0.2 miles feels identical, but to the engine, it's a "Bucket Boundary."

### 2. Administrative Offices (False Positives)

**Nuance**: Some national organizations have one administrative office (e.g., in San Francisco).
**Impact**: If a user searches in San Francisco, that National org might appear as "Neighborhood" help because it has a desk nearby, even if the actual service is just a phone line. We rely on data accuracy to minimize this.

### 3. "Remote" but physically close

**Nuance**: An organization might be physically 2 miles away but is only offering virtual/phone help for your specific search.
**Impact**: These results are grouped in the **National/Remote** bucket at the bottom of the list to ensure you don't walk to a building that isn't providing walk-in help.

### 4. "Extended Region" vs. "Out of Range"

**Nuance**: Anything beyond 200 miles is excluded from the physical tiers.
**Impact**: If an organization is 201 miles away, it will only appear in the **National/Remote** section at the bottom, even if it has a physical building.

---

# Technical Search Parity Scenarios (Legacy)

**Goal**: Verify that Standard Search (V1) and Advanced Search (V2) return identical results in the same order when no community focus sorting is active in Advanced Search.

**Expected Behavior**: For all test cases below, the **Result Count** and **Order of Results** should be identical between Standard and Advanced Search. The order should primarily be by distance (closest first).

---

## Test Scenarios

### 1. Basic Location Search

- **Input**:
  - Location: "New Almaden, CA"
  - Services: None
  - More Filters: None
  - Advanced Search Toggle: OFF (for Standard) / ON (for Advanced, but no community focuses selected)
- **Expected**: Both searches return the same number of results, sorted by distance.

### 2. Single Service Filter

- **Input**:
  - Location: "New Almaden, CA"
  - Services: "Abortion Care"
  - More Filters: None
  - Advanced Search Toggle: OFF / ON (no community focuses)
- **Expected**: Both searches return the same number of results, sorted by distance.

### 3. Multiple Service Filters (OR Logic)

- **Input**:
  - Location: "New Almaden, CA"
  - Services: "Abortion Care", "Mental Health" (selected as OR)
  - More Filters: None
  - Advanced Search Toggle: OFF / ON (no community focuses)
- **Expected**: Both searches return the same number of results, sorted by distance.

### 4. Single "More Filter" (Include)

- **Input**:
  - Location: "New Almaden, CA"
  - Services: None
  - More Filters: "Free of Cost" (Include)
  - Advanced Search Toggle: OFF / ON (no community focuses)
- **Expected**: Both searches return the same number of results, sorted by distance.

### 5. Combination of Service and "More Filter" (AND Logic)

- **Input**:
  - Location: "New Almaden, CA"
  - Services: "Abortion Care"
  - More Filters: "Free of Cost" (Include)
  - Advanced Search Toggle: OFF / ON (no community focuses)
- **Expected**: Both searches return the same number of results (should be 1, as per previous discussion), sorted by distance.

### 6. Search Yielding National/Remote Results

- **Input**:
  - Location: "Remote Area, e.g., Alaska" (or a location with few local results)
  - Services: "Abortion Care"
  - More Filters: None
  - Advanced Search Toggle: OFF / ON (no community focuses)
- **Expected**: Both searches return the same number of results, with national/remote organizations appearing after local results (if any), sorted by distance within their respective groups.

### 7. No Results Found

- **Input**:
  - Location: "New Almaden, CA"
  - Services: "Crisis Intervention"
  - More Filters: "Requires Photo ID" (Exclude)
  - Advanced Search Toggle: OFF / ON (no community focuses)
- **Expected**: Both searches return 0 results.

---

# Search V2 Logic Summary & Nuanced Scenarios

This section provides the technical and product context for the V2 "Empowered Search" engine to guide team discussions and tuning.

## 1. The Five-Tier Proximity Architecture

To ensure users see walk-in resources first while still prioritizing identity-matching results, V2 uses a "Tiered" approach in the SQL `ORDER BY` clause based on human-centric distance intervals:

1.  **Tier 1: Neighborhood (<= 10 miles)**: Resources in the user's immediate community.
2.  **Tier 2: Local (11 - 25 miles)**: Resources within a standard commuting distance.
3.  **Tier 3: Region (26 - 50 miles)**: Resources requiring a purposeful trip.
4.  **Tier 4: Extended Region (51 - 200 miles)**: Distant physical resources within the broader region.
5.  **Tier 5: National/Remote**: Virtual resources or those matching via Service Area only.

**The Golden Rule**: A result in a higher tier (e.g., Tier 1) will **always** appear before a result in a lower tier (e.g., Tier 2). Community Focus bubbling only applies **within** each individual tier.

## 2. Fundamental Reason for Ranking "Wonkiness"

The primary challenge in V2 development was **Weight Imbalance**.

- **Physical Signal**: The distance decay formula produces a value between `0.0` and `1.0`.
- **Identity Signal**: Community Focus matches produce values of `1000`, `100`, or `10`.

Because the Identity Signal is orders of magnitude larger, a National resource with one match would normally "leapfrog" a local resource 1 mile away. The implementation of **Locality Tiers** (Bucket sorting) was the solution to prevent identity matches from "polluting" the hyper-local results.

## 3. Nuanced Scenarios for Discussion

### A. The "Distance vs. Fit" Trade-off (Within Tiers)

**Scenario**: User selects "Youth" focus.

- **Org A**: 45 miles away, matches "Youth" (+1000 points).
- **Org B**: 2 miles away, no match (+0 points).
  **Result**: Org A appears at #1.
  **Discussion**: Is 45 miles too far to "bubble" over a 2-mile result? If so, we may need to shrink the "Hyper-Local" tier or adjust the `distanceImpact` constant.

### B. National Resources with Physical Offices

**Scenario**: A National hotline has one administrative office in San Francisco. A user searches in New Orleans.
**Result**: Because the office is > 200 miles away, it is excluded from Tier 1 and 2 and correctly falls into Tier 3 (National/Remote).
**Risk**: If an organization has coordinates in the database that are slightly "off," it can trigger an incorrect Locality Tier.

### E. High Service Density "Noise"

**Scenario**: An organization provides 15 different services (Housing, Food, Legal, etc.).
**Result**: Even if it doesn't match a community focus, its "Service Match Weight" (currently disabled) would accumulate points for every service matched, potentially pushing it above a more specialized 1-service organization.
**Decision**: This is why Service Match weights are currently set to 0.

### F. Shared Addresses & Tie-Breaking

**Scenario**: Five different non-profits operate out of the same community center (0 miles distance).
**Result**: Standard Search (V1) is non-deterministic (random order). V2 uses `slug ASC` to ensure the list remains stable every time the user refreshes.

## 4. Tuning Levers (searchConfig.ts)

| Constant                | Purpose                                                                     |
| :---------------------- | :-------------------------------------------------------------------------- |
| `priorityWeights`       | How much "bubbling" power each rank has (1000, 100, 10).                    |
| `distanceDecayDampener` | How quickly the proximity score drops as distance increases.                |
| `isLocal` (Radius)      | The boundary (currently 200mi) that decides if an item is Tier 2 or Tier 3. |
