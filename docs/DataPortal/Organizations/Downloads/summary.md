# Data Admin Dashboard - Downloads Summary

This document describes the CSV reports available in the Data Admin Dashboard, including their purpose, underlying logic, and the SQL queries used to generate them.

## 1. Published/Unpublished Lists

### All Published Organizations

**File Name:** `all_published_organizations.csv`
**Purpose:** A master list of all organizations currently visible on the platform.
**Logic:** Reads from the `organizations_csv_export_view` database view, filtered to
`published = TRUE AND deleted = FALSE` (`query.getAllPublishedForCSV.handler.ts`). It is used for
full-system data audits.

### All Unpublished Organizations

**File Name:** `all_unpublished_organizations.csv`
**Purpose:** A master list of all organizations that are not yet published.
**Logic:** Same view, filtered to `published = FALSE AND deleted = FALSE`
(`query.getAllUnpublishedForCSV.handler.ts`). Both reports include a computed **`status`** column
(added by migration `20260901121500_add_status_to_csv_view`) — "Published" or the row's
`unpublishedReason` label (New/In progress/Waiting to hear back/Inactive/Unaffirming/Unresponsive) —
which replaced a raw `published` boolean column, matching the same Status system documented in
[`../README.md`](../README.md#how-to-use-it).

## 2. Review Lists

### All Orgs with Reviews (Published and Unpublished)

**File Name:** `all_orgs_with_reviews.csv`
**Purpose:** Provides a list of organizations that have received user reviews, regardless of publication status.
**Logic:** Joins the `Organization` table with the `Review` table.

- **Aggregation:** Counts total reviews per organization.
- **Columns:** Includes Org Name, Average Rating, and Total Review Count.

## 3. Organization Counts

### Logic: "Unique Organization" Counting

Reports in this section count unique **Organization Entities**. Even if an organization has 50 locations and 100 services, it is counted as **1** unit in these reports.

### Published Organizations & Services in California

**File Name:** `count_of_org_services_in_california.csv`
**Purpose:** Specific granular reporting for organizations and services located in California.
**Logic:** This report generates a high-level two-row summary for the state of California, comparing organizational presence versus total service availability.

- **Result Format:** Utilizes `UNION ALL` to present two distinct metrics as labeled rows.
- **Organization Count:** Counts unique `Organization` entities (`DISTINCT o.id`) that have at least one location in California.
- **Service Count:** Counts total `OrgService` instances linked to locations in California.
- **Filtering:** Includes only records marked as `published` and specifically targets the California governing district ID (`gdst_01GW2HJ23GMD17FBJMJWD16PZ1`).

### SQL Query

This report utilizes the logic from the `PublishedOrgsServicesCalifornia` view:

```sql
 SELECT 'Published Orgs in California'::text AS category,
    count(DISTINCT o.id) AS count
   FROM "Organization" o
     JOIN "OrgLocation" ol ON o.id = ol."orgId"
  WHERE o.published IS TRUE AND ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1'::text
UNION ALL
 SELECT 'Published Services in California'::text AS category,
    count(os.id) AS count
   FROM "OrgService" os
     JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
     JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
  WHERE os.published IS TRUE AND ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1'::text;
```

### Sample Results

| category                         | count |
| :------------------------------- | :---- |
| Published Orgs in California     | 152   |
| Published Services in California | 450   |

### Published Organizations By Country & Attribute

**File Name:** `count_of_org_by_country_attribute.csv`
**Purpose:** Counts of organizations grouped by country and system-defined attributes.
**Logic:** This report provides a pivoted count of unique organizations, categorized by specific system-defined attributes, broken down by country.

- **Pivoted Format:** The report displays attribute names as rows and country names (United States, Canada, Mexico, Other) as columns, showing the count of organizations for each intersection.
- **Attribute Filtering:** The query specifically filters for a predefined set of `Attribute` IDs, ensuring only relevant organizational attributes are included (e.g., "LGBTQ+ Founded", "BIPOC Led").
- **Deduplication:** An organization is counted once per country if it possesses any of the specified attributes.
- **Filtering:** Only includes organizations that are currently `published`.

### SQL Query

This report utilizes the logic from the `OrganizationsCountryCountsByAttribute` view:

```sql
 SELECT a.name AS attribute,
    count(
        CASE
            WHEN ol."countryId" = 'ctry_01GW2HHDK9M26M80SG63T21SVH'::text THEN 1
            ELSE NULL::integer
        END) AS "United States",
    count(
        CASE
            WHEN ol."countryId" = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text THEN 1
            ELSE NULL::integer
        END) AS "Canada",
    count(
        CASE
            WHEN ol."countryId" = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text THEN 1
            ELSE NULL::integer
        END) AS "Mexico",
    count(
        CASE
            WHEN ol."countryId" <> ALL (ARRAY['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text]) THEN 1
            ELSE NULL::integer
        END) AS "Other"
   FROM "Organization" o
     JOIN "OrgLocation" ol ON o.id = ol."orgId"
     JOIN "AttributeSupplement" ats ON ats."organizationId" = o.id
     JOIN "Attribute" a ON ats."attributeId" = a.id
  WHERE o.published IS TRUE AND (a.id = ANY (ARRAY['attr_01GW2HHFVN3JX2J7REFFT5NAMS'::text, 'attr_01GW2HHFVN3RYX9JMXDZSQZM70'::text, 'attr_01GW2HHFVNHMF72WHVKRF6W4TA'::text, 'attr_01GW2HHFVNPKMHYK12DDRVC1VJ'::text, 'attr_01H273GW0GN44GZ5RK1F51Z1QZ'::text, 'attr_01J1DF9MFN8QWFXKYR7XFJANSF'::text]))
  GROUP BY a.name
  ORDER BY a.name;
```

### Sample Results

| attribute  | United States | Canada | Mexico | Other |
| :--------- | :------------ | :----- | :----- | :---- |
| LGBTQ+ Led | 120           | 10     | 2      | 1     |
| BIPOC Led  | 80            | 5      | 1      | 0     |
| Women Led  | 150           | 12     | 3      | 1     |

### Published Organizations By Country

**File Name:** `count_of_org_by_country.csv`
**Purpose:** High-level reporting on the number of unique organizations operating per country.
**Logic:** This report provides a high-level overview of the total number of unique organizations operating within primary countries (United States, Canada, Mexico) and a catch-all "Other" category.

- **Pivoted Format:** Unlike geographic breakdown reports that return rows for each region, this report returns a single row with country names as column headers.
- **Deduplication:** Uses a subquery with `DISTINCT ON (o.id, ol."countryId")` to ensure organizations are counted exactly once per country, regardless of how many locations they have in that country.
- **Filtering:** Only includes organizations that are currently `published`.

### SQL Query

This report utilizes the logic from the `OrganizationsCountryCounts` view:

```sql
 SELECT count(
        CASE
            WHEN distinct_orgs."countryId" = 'ctry_01GW2HHDK9M26M80SG63T21SVH'::text THEN 1
            ELSE NULL::integer
        END) AS "United States",
    count(
        CASE
            WHEN distinct_orgs."countryId" = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text THEN 1
            ELSE NULL::integer
        END) AS "Canada",
    count(
        CASE
            WHEN distinct_orgs."countryId" = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text THEN 1
            ELSE NULL::integer
        END) AS "Mexico",
    count(
        CASE
            WHEN distinct_orgs."countryId" <> ALL (ARRAY['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text]) THEN 1
            ELSE NULL::integer
        END) AS "Other"
   FROM ( SELECT DISTINCT ON (o.id, ol."countryId") o.id AS org_id,
            ol."countryId"
           FROM "Organization" o
             JOIN "OrgLocation" ol ON o.id = ol."orgId"
          WHERE o.published IS TRUE
          ORDER BY o.id, ol."countryId") distinct_orgs;
```

### Sample Results

| United States | Canada | Mexico | Other |
| :------------ | :----- | :----- | :---- |
| 450           | 25     | 5      | 2     |

### Published Organizations By Country & State

**File Name:** `count_of_org_by_country_state.csv`
**Purpose:** High-level reporting on the number of unique organizations operating within a specific state or province.
**Logic:** This report identifies the number of unique **Organization Entities** that maintain a physical presence (location) within a specific administrative region.

- **Unique Count:** An organization is counted exactly once per state/territory, even if it has multiple offices or diverse services in that region.
- **Joins:** Joins the `Organization` table with `OrgLocation`, `GovDist`, and `Country` to map organizations to their geographic states.
- **Filtering:** Includes only organizations where `published` is `true`.

### SQL Query

This report utilizes the logic from the `OrganizationsCountByState` view:

```sql
 SELECT c.name AS country,
    gd.name AS state_or_territory,
    count(DISTINCT os.id) AS organization_count
   FROM "Organization" os
     JOIN "OrgLocation" ol ON os.id = ol."orgId"
     LEFT JOIN "GovDist" gd ON ol."govDistId" = gd.id
     JOIN "Country" c ON ol."countryId" = c.id
  WHERE os.published IS TRUE
  GROUP BY c.name, gd.name
  ORDER BY c.name, gd.name;
```

### Sample Results

| country       | state_or_territory | organization_count |
| :------------ | :----------------- | :----------------- |
| Canada        | Ontario            | 12                 |
| United States | California         | 152                |
| United States | New York           | 89                 |

## 4. Service Counts

### Published Services By Category in California

**File Name:** `count_of_services_by_category_in_california.csv`
**Purpose:** Capability counts grouped by category specifically for California.
**Logic:** This report provides a high-level summary of published organizations and services within California. While named "By Category," the implementation currently provides an aggregate count labeled with hardcoded categories.

- **Aggregation:** Uses `UNION ALL` to present a comparison between unique organization counts and total service availability.
- **Filtering:** Targets the California governing district (`gdst_01GW2HJ23GMD17FBJMJWD16PZ1`) and filters for `published` records.

### SQL Query

This report utilizes the logic from the `ServicesCountByCategoryCalifornia` view:

```sql
 SELECT 'Published Orgs in California'::text AS category,
    count(DISTINCT o.id) AS count
   FROM "Organization" o
     JOIN "OrgLocation" ol ON o.id = ol."orgId"
  WHERE o.published IS TRUE AND ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1'::text
UNION ALL
 SELECT 'Published Services in California'::text AS category,
    count(os.id) AS count
   FROM "OrgService" os
     JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
     JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
  WHERE os.published IS TRUE AND ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1'::text;
```

### Sample Results

| category                         | count |
| :------------------------------- | :---- |
| Published Orgs in California     | 152   |
| Published Services in California | 450   |

### Published Services By Category & Country

**File Name:** `count_of_services_by_category_country.csv`
**Purpose:** Capability counts grouped by service category and country.
**Logic:** This report provides a count of unique published services per category, pivoted by country. It includes custom logic to identify and group "Trans Focused" resources.

- **Trans Focus Isolation:** Services containing specific "Trans" related tags or keywords are moved out of their primary categories and aggregated into a special "Trans Focused Services" row.
- **Pivoted Format:** Displays categories as rows and countries (United States, Canada, Mexico, Other) as columns.
- **Deduplication:** Counts unique `OrgService` IDs (`count(DISTINCT service_id)`) to ensure a service is not double-counted within a single category/country intersection.
- **Filtering:** Only includes services where `published` is `true`.

### SQL Query

This report utilizes the logic from the `ServicesCountByCountCategoryByCountry` view:

```sql
 WITH tag_with_trans AS (
         SELECT st.id,
            st."primaryCategoryId",
            st."tsKey",
                CASE
                    WHEN st."tsKey" ~~* '%.trans-%'::text OR (st.id = ANY (ARRAY['svtg_01GW2HHFBQ02KJQ7E5NPM3ERNE'::text, 'svtg_01GW2HHFBR506BA0ZA7XZWX23Q'::text, 'svtg_01GW2HHFBSBVW6KJACB43FTFNQ'::text, 'svtg_01GW2HHFBSZJ7ZQD3AVMKQK83N'::text, 'svtg_01GW2HHFBSG3BES4BKSW269M8K'::text, 'svtg_01GW2HHFBS5YQWBD8N2V56X5X0'::text, 'svtg_01HAD647BVMT10DWEXFG1EFM9J'::text, 'svtg_01GW2HHFBSPTXA7Q4W5RKFP53W'::text, 'svtg_01GW2HHFBQ817GKC3K6D6JGMVC'::text, 'svtg_01GW2HHFBQNARDK4H2W30GC1QR'::text, 'svtg_01GW2HHFBRB8R4AQVR2FYE72EC'::text, 'svtg_01GW2HHFBS72MEA9GWN7FWYWQA'::text])) THEN true
                    ELSE false
                END AS is_trans_focused
           FROM "ServiceTag" st
        ), categorized AS (
         SELECT
                CASE
                    WHEN twt.is_trans_focused THEN 'Trans Focused Services'::text
                    ELSE sc.category
                END AS category,
            os.id AS service_id,
            c.id AS country_id
           FROM tag_with_trans twt
             JOIN "ServiceCategory" sc ON twt."primaryCategoryId" = sc.id
             JOIN "OrgServiceTag" ost ON ost."tagId" = twt.id
             JOIN "OrgService" os ON os.id = ost."serviceId" AND os.published IS TRUE
             JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
             JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
             JOIN "Country" c ON ol."countryId" = c.id
        UNION ALL
         SELECT 'Trans Focused Services'::text AS category,
            os.id AS service_id,
            c.id AS country_id
           FROM tag_with_trans twt
             JOIN "ServiceCategory" sc ON twt."primaryCategoryId" = sc.id
             JOIN "OrgServiceTag" ost ON ost."tagId" = twt.id
             JOIN "OrgService" os ON os.id = ost."serviceId" AND os.published IS TRUE
             JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
             JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
             JOIN "Country" c ON ol."countryId" = c.id
          WHERE twt.is_trans_focused = true
        )
 SELECT categorized.category AS "Service Category",
    count(DISTINCT categorized.service_id) FILTER (WHERE categorized.country_id = 'ctry_01GW2HHDK9M26M80SG63T21SVH'::text) AS "United States",
    count(DISTINCT categorized.service_id) FILTER (WHERE categorized.country_id = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text) AS "Canada",
    count(DISTINCT categorized.service_id) FILTER (WHERE categorized.country_id = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text) AS "Mexico",
    count(DISTINCT categorized.service_id) FILTER (WHERE categorized.country_id <> ALL (ARRAY['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text])) AS "Other"
   FROM categorized
  GROUP BY categorized.category
  ORDER BY categorized.category;
```

### Sample Results

| Service Category       | United States | Canada | Mexico | Other |
| :--------------------- | :------------ | :----- | :----- | :---- |
| Housing                | 45            | 3      | 0      | 0     |
| Legal                  | 32            | 1      | 1      | 0     |
| Trans Focused Services | 112           | 8      | 2      | 1     |

### Published Services By Category, State, & Country

**File Name:** `count_of_services_by_category_state_country.csv`
**Purpose:** Capability counts grouped by service category, state/province, and country.
**Logic:** This report provides a detailed breakdown of published services, grouped by their primary category, the state/province, and the country where they are offered.

- **Service Count:** It counts unique `OrgService` entities. Note that this is a count of distinct service offerings, not a "Capability Count" that would expand to individual service tags.
- **Grouping:** Results are aggregated by country name, state/province name, and service category.
- **Filtering:** Only includes services that are `published`.

### SQL Query

This report utilizes the logic from the `ServicesCountByCategoryByStateByCountry` view:

```sql
 SELECT c.name AS country_name,
    gd.name AS state_province_name,
    sc.category,
    count(DISTINCT os.id) AS service_count
   FROM "OrgService" os
     JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
     JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
     LEFT JOIN "GovDist" gd ON ol."govDistId" = gd.id
     JOIN "Country" c ON ol."countryId" = c.id
     JOIN "OrgServiceTag" ost ON os.id = ost."serviceId"
     JOIN "ServiceTag" st ON ost."tagId" = st.id
     JOIN "ServiceCategory" sc ON st."primaryCategoryId" = sc.id
  WHERE os.published IS TRUE
  GROUP BY c.name, gd.name, sc.category
  ORDER BY c.name, gd.name, sc.category;
```

### Sample Results

| country_name  | state_province_name | category      | service_count |
| :------------ | :------------------ | :------------ | :------------ |
| Canada        | Ontario             | Mental Health | 15            |
| United States | California          | Housing       | 85            |
| United States | California          | Legal         | 42            |
| United States | New York            | Food          | 30            |

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

### Published Services By Attribute & Country

**File Name:** `count_of_services_by_attribute_country.csv`
**Purpose:** Counts of services/features filtered by specific system attributes and country.
**Logic:** This report provides a pivoted count of unique published services, categorized by specific system-defined attributes (e.g., cost-related attributes like "Free" or "Sliding Scale"), broken down by country.

- **Pivoted Format:** The report displays attribute names as rows and country names (United States, Canada, Mexico, Other) as columns.
- **Deduplication:** Counts unique `OrgService` IDs (`count(DISTINCT os.id)`) to ensure a service is counted exactly once per attribute/country intersection, regardless of how many locations it has.
- **Attribute Filtering:** The query filters for a specific set of `Attribute` IDs relevant to service delivery.
- **Filtering:** Only includes services where `published` is `true`.

### SQL Query

This report utilizes the logic from the `ServicesCountByCountryAttribute` view:

```sql
 SELECT attr.name AS "Attribute",
    count(DISTINCT
        CASE
            WHEN c.id = 'ctry_01GW2HHDK9M26M80SG63T21SVH'::text THEN os.id
            ELSE NULL::text
        END) AS "United States",
    count(DISTINCT
        CASE
            WHEN c.id = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text THEN os.id
            ELSE NULL::text
        END) AS "Canada",
    count(DISTINCT
        CASE
            WHEN c.id = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text THEN os.id
            ELSE NULL::text
        END) AS "Mexico",
    count(DISTINCT
        CASE
            WHEN c.id <> ALL (ARRAY['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text]) THEN os.id
            ELSE NULL::text
        END) AS "Other"
   FROM "Attribute" attr
     LEFT JOIN "AttributeSupplement" a ON a."attributeId" = attr.id
     LEFT JOIN "OrgService" os ON a."serviceId" = os.id AND os.published IS TRUE
     LEFT JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
     LEFT JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
     LEFT JOIN "Country" c ON ol."countryId" = c.id
  WHERE attr.id = ANY (ARRAY['attr_01GW2HHFVN72D7XEBZZJXCJQXQ'::text, 'attr_01GW2HHFVPCVX8F3B7M30ZJEHW'::text, 'attr_01GW2HHFVPJERY0GS9D7F56A23'::text, 'attr_01GW2HHFVPSYBCYF37B44WP6CZ'::text, 'attr_01GW2HHFVPTK9555WHJHDBDA2J'::text, 'attr_01GW2HHFVQ7SYGD3KM8WP9X50B'::text, 'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F'::text, 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW'::text, 'attr_01GW2HHFVQEFWW42MBAD64BWXZ'::text, 'attr_01GW2HHFVQVEGH6W3A2ANH1QZE'::text, 'attr_01GW2HHFVQX4M8DY1FSAYSJSSK'::text, 'attr_01GW2HHFVRMQFJ9AMA633SQQGV'::text, 'attr_01H273DMQ22TVP3RA36M1XWFBA'::text, 'attr_01H273ETEX43K0BR6FG3G7MZ4S'::text, 'attr_01H273FCJ8NNG1T1BV300CN702'::text, 'attr_01H273FPTCFKTVBNK158HE9M42'::text, 'attr_01H273G39A14TGHT4DA1T0DW5M'::text])
  GROUP BY attr.name
  ORDER BY attr.name;
```

### Sample Results

| Attribute          | United States | Canada | Mexico | Other |
| :----------------- | :------------ | :----- | :----- | :---- |
| Free               | 850           | 40     | 8      | 2     |
| Sliding Scale      | 320           | 15     | 2      | 1     |
| Insurance Accepted | 410           | 2      | 0      | 0     |

### Published Services By Country

**File Name:** `count_of_services_by_country.csv`
**Purpose:** Total count of published services operating per country.
**Logic:** This report provides a high-level overview of the total number of unique services operating within primary countries (United States, Canada, Mexico) and a catch-all "Other" category.

- **Pivoted Format:** Returns a single row with country names as column headers.
- **Deduplication:** Uses a subquery to count unique `OrgService` IDs per country, ensuring a service is counted once per country even if it is offered at multiple locations in that country.
- **Filtering:** Only includes services where `published` is `true`.

### SQL Query

This report utilizes the logic from the `ServicesCountByCountry` view:

```sql
 SELECT count(
        CASE
            WHEN c.id = 'ctry_01GW2HHDK9M26M80SG63T21SVH'::text THEN 1
            ELSE NULL::integer
        END) AS "United States",
    count(
        CASE
            WHEN c.id = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text THEN 1
            ELSE NULL::integer
        END) AS "Canada",
    count(
        CASE
            WHEN c.id = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text THEN 1
            ELSE NULL::integer
        END) AS "Mexico",
    count(
        CASE
            WHEN c.id <> ALL (ARRAY['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text]) THEN 1
            ELSE NULL::integer
        END) AS "Other"
   FROM ( SELECT DISTINCT os.id,
            ol."countryId"
           FROM "OrgService" os
             JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
             JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
          WHERE os.published IS TRUE) distinct_services
     JOIN "Country" c ON distinct_services."countryId" = c.id;
```

### Sample Results

| United States | Canada | Mexico | Other |
| :------------ | :----- | :----- | :---- |
| 1250          | 65     | 12     | 4     |

### Published Services By Country & State

**File Name:** `count_of_services_by_country_state.csv`
**Purpose:** High-level reporting on the number of services available within a specific state or province.
**Logic:** This report counts the total number of service offerings (`OrgService`) associated with locations in a given administrative region.

- **Count Method:** It counts every instance of a service being offered at a location. If a service is offered at multiple locations within the same state, it is counted for each location.
- **Filtering:** Includes only services where `published` is `true`.

### SQL Query

This report utilizes the logic from the `ServicesCountByCountByState` view:

```sql
SELECT c.name AS country,
    gd.name AS state_or_territory,
    count(os.id) AS service_count
   FROM "OrgService" os
     JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
     JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
     LEFT JOIN "GovDist" gd ON ol."govDistId" = gd.id
     JOIN "Country" c ON ol."countryId" = c.id
  WHERE os.published IS TRUE
  GROUP BY c.name, gd.name
  ORDER BY c.name, gd.name;
```

### Sample Results

| country       | state_or_territory | service_count |
| :------------ | :----------------- | :------------ |
| Canada        | Ontario            | 45            |
| United States | California         | 450           |
| United States | New York           | 210           |

### SQL Logic for Section 4 (General)

Except for the Postal Code report, these reports use a standard service count logic:

```sql
SELECT
    c.name as "Country",
    gd.name as "State",
    count(os.id) as "Service Count"
FROM "OrgService" os
JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
JOIN "Country" c ON ol."countryId" = c.id
LEFT JOIN "GovDist" gd ON ol."govDistId" = gd.id
WHERE os.published IS TRUE AND os.deleted IS FALSE
GROUP BY c.name, gd.name;
```

---

_Last Updated: May 2024_
_Author: Data Admin Team_
