# Data Admin Dashboard - Downloads Summary

This document describes the CSV reports available in the Data Admin Dashboard, including their purpose, underlying logic, and the SQL queries used to generate them.

## 1. Published/Unpublished Lists

### All Published Organizations

**File Name:** `all_published_organizations.csv`
**Purpose:** A master list of all organizations currently visible on the platform.

### All Unpublished Organizations

**File Name:** `all_unpublished_organizations.csv`
**Purpose:** A master list of all organizations that are not yet published.

## 2. Review Lists

### All Orgs with Reviews (Published and Unpublished)

**File Name:** `all_orgs_with_reviews.csv`
**Purpose:** Provides a list of organizations that have received user reviews, regardless of publication status.

## 3. Organization Counts

### Published Organizations & Services in California

**File Name:** `count_of_org_services_in_california.csv`
**Purpose:** Specific granular reporting for organizations and services located in California.

### Published Organizations By Country & Attribute

**File Name:** `count_of_org_by_country_attribute.csv`
**Purpose:** Counts of organizations grouped by country and system-defined attributes.

### Published Organizations By Country

**File Name:** `count_of_org_by_country.csv`
**Purpose:** High-level reporting on the number of unique organizations operating per country.

### Published Organizations By Country & State

**File Name:** `count_of_org_by_country_state.csv`
**Purpose:** High-level reporting on the number of unique organizations operating within a specific state or province.

## 4. Service Counts

### Published Services By Country & State & Postal Code

**File Name:** `count_of_services_by_category_zipcode_state_country.csv`

#### Nuance: "Capability Count" Logic

Unlike a simple count of physical locations, this report counts every "Service Tag" (Feature) associated with a service at a specific location.

- **Feature Expansion:** If one program (e.g., "Assistance for Survivors") offers both "Hotlines" and "Counseling," it is counted as **2** units of service for that ZIP code.
- **Aggregation:** The results are grouped by the primary **Service Category**.
- **Site Deduplication:** If the same specific feature (tag) is offered multiple times at the same physical street address, it is counted only **once** to prevent data entry duplicates from inflating site counts.

### SQL View Definition

This report queries the `ServicesCountByCategoryByStateByPostalCode` view:

```sql
CREATE OR REPLACE VIEW public."ServicesCountByCategoryByStateByPostalCode" AS
SELECT
    sc.category AS "category",
    ol."postCode" AS "postal_code",
    COALESCE(gd.name, 'N/A') AS "state_province_name",
    c.name AS "country_name",
    COUNT(DISTINCT (st.id, ol.street1))::integer AS "service_count"
FROM "OrgService" os
JOIN "Organization" o ON os."organizationId" = o.id
JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
JOIN "Country" c ON ol."countryId" = c.id
LEFT JOIN "GovDist" gd ON ol."govDistId" = gd.id
JOIN "OrgServiceTag" ost ON os.id = ost."serviceId"
JOIN "ServiceTag" st ON ost."tagId" = st.id
JOIN "ServiceCategory" sc ON st."primaryCategoryId" = sc.id
WHERE os.published IS TRUE
  AND os.deleted IS FALSE
  AND o.published IS TRUE
  AND o.deleted IS FALSE
GROUP BY sc.category, ol."postCode", gd.name, c.name;
```

### Sample Data and Expected Results

#### Raw Input Data (Example: Planned Parenthood)

| Service Name       | Category      | Service Tag           | ZIP Code | Street Address         |
| :----------------- | :------------ | :-------------------- | :------- | :--------------------- |
| Access abortion... | Abortion Care | Abortion providers    | 10012    | **26 Bleecker Street** |
| Access abortion... | Abortion Care | Abortion providers    | 10012    | **123 Main Street**    |
| Access abortion... | Medical       | HIV and sexual health | 10012    | 26 Bleecker Street     |
| Access abortion... | Medical       | Medical clinics       | 10012    | 26 Bleecker Street     |
| Access hormone...  | Medical       | Trans health          | 10012    | 26 Bleecker Street     |
| Get support...     | Mental Health | Hotlines              | 10012    | 26 Bleecker Street     |
| Get support...     | Mental Health | Private counseling    | 10012    | 26 Bleecker Street     |

#### Aggregated CSV Output

| Service Category  | ZIP Code | State    | Country       | Count of Services |
| :---------------- | :------- | :------- | :------------ | :---------------- |
| **Abortion Care** | 10012    | New York | United States | **2**             |
| Medical           | 10012    | New York | United States | 3                 |
| Mental Health     | 10012    | New York | United States | 2                 |

### Data Verification Query

If you need to verify the specific records contributing to a count, use this detailed query in pgAdmin. It removes the aggregation so you can see every unique "Capability Instance" and its associated address:

```sql
SELECT
    o.name AS "Organization Name",
    COALESCE(tk.text, os."legacyName") AS "Service Name",
    sc.category AS "Category",
    st.name AS "Service Tag",
    ol.city AS "City",
    ol."postCode" AS "ZIP Code",
    ol.street1 AS "Street Address"
FROM "OrgService" os
JOIN "Organization" o ON os."organizationId" = o.id
JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
JOIN "OrgServiceTag" ost ON os.id = ost."serviceId"
JOIN "ServiceTag" st ON ost."tagId" = st.id
JOIN "ServiceCategory" sc ON st."primaryCategoryId" = sc.id
LEFT JOIN "FreeText" ft ON os."serviceNameId" = ft.id
LEFT JOIN "TranslationKey" tk ON ft.key = tk.key AND ft.ns = tk.ns
WHERE os.published IS TRUE AND os.deleted IS FALSE AND o.published IS TRUE AND o.deleted IS FALSE
ORDER BY "ZIP Code", "Category", "Organization Name", "Street Address";
```

### Published Services By Category in California

**File Name:** `count_of_services_by_category_in_california.csv`
**Purpose:** Capability counts grouped by category specifically for California.

### Published Services By Category & Country

**File Name:** `count_of_services_by_category_country.csv`
**Purpose:** Capability counts grouped by service category and country.

### Published Services By Category, State, & Country

**File Name:** `count_of_services_by_category_state_country.csv`
**Purpose:** Capability counts grouped by service category, state/province, and country.

### Published Services By Attribute & Country

**File Name:** `count_of_services_by_attribute_country.csv`
**Purpose:** Counts of services/features filtered by specific system attributes and country.

### Published Services By Country

**File Name:** `count_of_services_by_country.csv`
**Purpose:** Total count of published service capabilities per country.

### Published Services By Country & State

**File Name:** `count_of_services_by_country_state.csv`
**Purpose:** Capability counts grouped by country and state/province.

---

_Last Updated: May 2024_
_Author: Data Admin Team_
