-- UP Migration
DROP VIEW IF EXISTS "OrganizationsCountryCounts";
CREATE VIEW "OrganizationsCountryCounts" AS
SELECT
  COUNT(CASE WHEN distinct_orgs."countryId" = 'ctry_01GW2HHDK9M26M80SG63T21SVH' THEN 1 END) AS "United States",
  COUNT(CASE WHEN distinct_orgs."countryId" = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' THEN 1 END) AS "Canada",
  COUNT(CASE WHEN distinct_orgs."countryId" = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' THEN 1 END) AS "Mexico",
  COUNT(CASE WHEN distinct_orgs."countryId" NOT IN (
    'ctry_01GW2HHDK9M26M80SG63T21SVH',
    'ctry_01GW2HHDKAWXWYHAAESAA5HH94',
    'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'
  ) THEN 1 END) AS "Other"
FROM (
  SELECT DISTINCT ON (o.id, ol."countryId") o.id as "org_id", ol."countryId"
  FROM public."Organization" o
  JOIN public."OrgLocation" ol ON o.id = ol."orgId"
  WHERE o."published" IS true
  ORDER BY o.id ASC, ol."countryId" ASC
) AS distinct_orgs;
; -- Don't forget the semicolon after the CREATE VIEW statement
-----------------------------------

-----------------------------------
-- UP Migration
DROP VIEW IF EXISTS "OrganizationsCountryCountsByAttribute";
CREATE VIEW "OrganizationsCountryCountsByAttribute" AS

SELECT
  a.name AS attribute,
  COUNT(CASE WHEN ol."countryId" = 'ctry_01GW2HHDK9M26M80SG63T21SVH' THEN 1 END) AS "United States",
  COUNT(CASE WHEN ol."countryId" = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' THEN 1 END) AS "Canada",
  COUNT(CASE WHEN ol."countryId" = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' THEN 1 END) AS "Mexico",
  COUNT(CASE WHEN ol."countryId" NOT IN (
    'ctry_01GW2HHDK9M26M80SG63T21SVH',
    'ctry_01GW2HHDKAWXWYHAAESAA5HH94',
    'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'
  ) THEN 1 END) AS "Other"
FROM "Organization" o
JOIN "OrgLocation" ol ON o.id = ol."orgId"
JOIN "AttributeSupplement" ats ON ats."organizationId" = o.id
JOIN "Attribute" a ON ats."attributeId" = a.id
WHERE o.published IS TRUE
  AND a.id IN (
    'attr_01GW2HHFVN3JX2J7REFFT5NAMS',  -- Black-led
    'attr_01GW2HHFVN3RYX9JMXDZSQZM70',  -- Transgender-led
    'attr_01GW2HHFVNHMF72WHVKRF6W4TA',  -- Immigrant-led
    'attr_01GW2HHFVNPKMHYK12DDRVC1VJ',  -- BIPOC-led
    'attr_01H273GW0GN44GZ5RK1F51Z1QZ',  -- Women-led
    'attr_01J1DF9MFN8QWFXKYR7XFJANSF'   -- LGBTQ+ Led
  )
GROUP BY a.name
ORDER BY a.name;
; -- Don't forget the semicolon after the CREATE VIEW statement
-----------------------------------

-----------------------------------
-- UP Migration
DROP VIEW IF EXISTS "OrganizationsCountByState";
CREATE VIEW "OrganizationsCountByState" AS
SELECT
  c."name" AS country,
  gd."name" AS state_or_territory,
  COUNT(DISTINCT os."id") AS organization_count
FROM public."Organization" os
JOIN public."OrgLocation" ol ON os."id" = ol."orgId"
LEFT JOIN public."GovDist" gd ON ol."govDistId" = gd."id"
JOIN public."Country" c ON ol."countryId" = c."id"
WHERE os."published" IS TRUE
GROUP BY c."name", gd."name"
ORDER BY c."name" ASC, gd."name" ASC;
; -- Don't forget the semicolon after the CREATE VIEW statement

-----------------------------------

-----------------------------------
-- UP Migration
DROP VIEW IF EXISTS "PublishedOrgsServicesCalifornia";
CREATE VIEW "PublishedOrgsServicesCalifornia" AS
SELECT 'Published Orgs in California' AS category,
       COUNT(DISTINCT o.id) AS count
FROM public."Organization" o
JOIN public."OrgLocation" ol ON o.id = ol."orgId"
WHERE o."published" IS TRUE
  AND ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1'

UNION ALL

SELECT 'Published Services in California' AS category,
       COUNT(os."id") AS count
FROM public."OrgService" os
JOIN public."OrgLocationService" ols ON os."id" = ols."serviceId"
JOIN public."OrgLocation" ol ON ols."orgLocationId" = ol."id"
WHERE os."published" IS TRUE
  AND ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1';
; -- Don't forget the semicolon after the CREATE VIEW statement
-----------------------------------

-----------------------------------
-- UP Migration
DROP VIEW IF EXISTS "ServicesCountByCategoryCalifornia";
CREATE VIEW "ServicesCountByCategoryCalifornia" AS
SELECT 'Published Orgs in California' AS category,
       COUNT(DISTINCT o.id) AS count
FROM public."Organization" o
JOIN public."OrgLocation" ol ON o.id = ol."orgId"
WHERE o."published" IS TRUE
  AND ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1'

UNION ALL

SELECT 'Published Services in California' AS category,
       COUNT(os."id") AS count
FROM public."OrgService" os
JOIN public."OrgLocationService" ols ON os."id" = ols."serviceId"
JOIN public."OrgLocation" ol ON ols."orgLocationId" = ol."id"
WHERE os."published" IS TRUE
  AND ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1';

SELECT sc.category AS category,
       COUNT(DISTINCT os.id) AS count
FROM "ServiceCategory" sc
LEFT JOIN "ServiceTag" st ON st."primaryCategoryId" = sc.id
LEFT JOIN "OrgServiceTag" ost ON ost."tagId" = st.id
JOIN "OrgService" os ON os.id = ost."serviceId" AND os.published IS TRUE
JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
JOIN "OrgLocation" ol ON ols."orgLocationId" = ol."id"
WHERE ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1'
GROUP BY sc.category
ORDER BY category;
; -- Don't forget the semicolon after the CREATE VIEW statement

-----------------------------------
-- UP Migration
DROP VIEW IF EXISTS "ServicesCountByCountry";
CREATE VIEW "ServicesCountByCountry" AS

SELECT
  COUNT(CASE WHEN c."id" = 'ctry_01GW2HHDK9M26M80SG63T21SVH' THEN 1 END) AS "United States",
  COUNT(CASE WHEN c."id" = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' THEN 1 END) AS "Canada",
  COUNT(CASE WHEN c."id" = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' THEN 1 END) AS "Mexico",
  COUNT(CASE WHEN c."id" NOT IN (
    'ctry_01GW2HHDK9M26M80SG63T21SVH',
    'ctry_01GW2HHDKAWXWYHAAESAA5HH94',
    'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'
  ) THEN 1 END) AS "Other"
FROM (
  SELECT DISTINCT os."id", ol."countryId"
  FROM public."OrgService" os
  JOIN public."OrgLocationService" ols ON os."id" = ols."serviceId"
  JOIN public."OrgLocation" ol ON ols."orgLocationId" = ol."id"
  WHERE os."published" IS TRUE
) AS distinct_services
JOIN public."Country" c ON distinct_services."countryId" = c."id";

; -- Don't forget the semicolon after the CREATE VIEW statement
--------------------------------------

-----------------------------------
-- UP Migration
DROP VIEW IF EXISTS "ServicesCountByCountryAttribute";
CREATE VIEW "ServicesCountByCountryAttribute" AS

SELECT
  attr."name" AS "Attribute",
  COUNT(DISTINCT CASE WHEN c."id" = 'ctry_01GW2HHDK9M26M80SG63T21SVH' THEN os."id" END) AS "United States",
  COUNT(DISTINCT CASE WHEN c."id" = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' THEN os."id" END) AS "Canada",
  COUNT(DISTINCT CASE WHEN c."id" = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' THEN os."id" END) AS "Mexico",
  COUNT(DISTINCT CASE WHEN c."id" NOT IN (
    'ctry_01GW2HHDK9M26M80SG63T21SVH',
    'ctry_01GW2HHDKAWXWYHAAESAA5HH94',
    'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'
  ) THEN os."id" END) AS "Other"
FROM public."Attribute" attr
LEFT JOIN public."AttributeSupplement" a ON a."attributeId" = attr."id"
LEFT JOIN public."OrgService" os ON a."serviceId" = os."id" AND os."published" IS TRUE
LEFT JOIN public."OrgLocationService" ols ON os."id" = ols."serviceId"
LEFT JOIN public."OrgLocation" ol ON ols."orgLocationId" = ol."id"
LEFT JOIN public."Country" c ON ol."countryId" = c."id"
WHERE attr."id" IN (
  'attr_01GW2HHFVN72D7XEBZZJXCJQXQ',
  'attr_01GW2HHFVPCVX8F3B7M30ZJEHW',
  'attr_01GW2HHFVPJERY0GS9D7F56A23',
  'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
  'attr_01GW2HHFVPTK9555WHJHDBDA2J',
  'attr_01GW2HHFVQ7SYGD3KM8WP9X50B',
  'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F',
  'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
  'attr_01GW2HHFVQEFWW42MBAD64BWXZ',
  'attr_01GW2HHFVQVEGH6W3A2ANH1QZE',
  'attr_01GW2HHFVQX4M8DY1FSAYSJSSK',
  'attr_01GW2HHFVRMQFJ9AMA633SQQGV',
  'attr_01H273DMQ22TVP3RA36M1XWFBA',
  'attr_01H273ETEX43K0BR6FG3G7MZ4S',
  'attr_01H273FCJ8NNG1T1BV300CN702',
  'attr_01H273FPTCFKTVBNK158HE9M42',
  'attr_01H273G39A14TGHT4DA1T0DW5M'
)
GROUP BY attr."name"
ORDER BY attr."name";


; -- Don't forget the semicolon after the CREATE VIEW statement
--------------------------------------

-----------------------------------
-- UP Migration
DROP VIEW IF EXISTS "ServicesCountByState";
CREATE VIEW "ServicesCountByCountByState" AS

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
; -- Don't forget the semicolon after the CREATE VIEW statement
--------------------------------------


-----------------------------------
-- UP Migration
DROP VIEW IF EXISTS "ServicesCountCategoryByCountry";
CREATE VIEW "ServicesCountByCountCategoryByCountry" AS

WITH tag_with_trans AS (
  SELECT
    st.id,
    st."primaryCategoryId",
    st."tsKey",
    CASE
      WHEN st."tsKey" ILIKE '%.trans-%'
           OR st.id IN (
              'svtg_01GW2HHFBQ02KJQ7E5NPM3ERNE',
              'svtg_01GW2HHFBR506BA0ZA7XZWX23Q',
              'svtg_01GW2HHFBSBVW6KJACB43FTFNQ',
              'svtg_01GW2HHFBSZJ7ZQD3AVMKQK83N',
              'svtg_01GW2HHFBSG3BES4BKSW269M8K',
              'svtg_01GW2HHFBS5YQWBD8N2V56X5X0',
              'svtg_01HAD647BVMT10DWEXFG1EFM9J',
              'svtg_01GW2HHFBSPTXA7Q4W5RKFP53W',
              'svtg_01GW2HHFBQ817GKC3K6D6JGMVC',
              'svtg_01GW2HHFBQNARDK4H2W30GC1QR',
              'svtg_01GW2HHFBRB8R4AQVR2FYE72EC',
              'svtg_01GW2HHFBS72MEA9GWN7FWYWQA'
           )
        THEN TRUE ELSE FALSE
    END AS is_trans_focused
  FROM "ServiceTag" st
),
categorized AS (
  SELECT
    CASE
      WHEN twt.is_trans_focused THEN 'Trans Focused Services'
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

  SELECT
    'Trans Focused Services' AS category,
    os.id AS service_id,
    c.id AS country_id
  FROM tag_with_trans twt
  JOIN "ServiceCategory" sc ON twt."primaryCategoryId" = sc.id
  JOIN "OrgServiceTag" ost ON ost."tagId" = twt.id
  JOIN "OrgService" os ON os.id = ost."serviceId" AND os.published IS TRUE
  JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
  JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
  JOIN "Country" c ON ol."countryId" = c.id
  WHERE twt.is_trans_focused = TRUE
)
SELECT
  category AS "Service Category",
  COUNT(DISTINCT service_id) FILTER (WHERE country_id = 'ctry_01GW2HHDK9M26M80SG63T21SVH') AS "United States",
  COUNT(DISTINCT service_id) FILTER (WHERE country_id = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94') AS "Canada",
  COUNT(DISTINCT service_id) FILTER (WHERE country_id = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9') AS "Mexico",
  COUNT(DISTINCT service_id) FILTER (
    WHERE country_id NOT IN (
      'ctry_01GW2HHDK9M26M80SG63T21SVH',
      'ctry_01GW2HHDKAWXWYHAAESAA5HH94',
      'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'
    )
  ) AS "Other"
FROM categorized
GROUP BY category
ORDER BY category;

; -- Don't forget the semicolon after the CREATE VIEW statement
--------------------------------------

-----------------------------------
-- UP Migration
DROP VIEW IF EXISTS "UserSurveyAll";
CREATE VIEW "UserSurveyAll" AS
 WITH parsed AS (
         SELECT "UserSurvey".id,
            "UserSurvey"."birthYear",
            "UserSurvey"."reasonForJoin",
            "UserSurvey"."countryOriginId",
            "UserSurvey"."immigrationId",
            "UserSurvey"."currentCity",
            "UserSurvey"."currentGovDistId",
            "UserSurvey"."currentCountryId",
            "UserSurvey"."ethnicityOther",
            "UserSurvey"."immigrationOther",
            split_part("UserSurvey".id, '_'::text, 2) AS ulid_part
           FROM "UserSurvey"
        ), decoded AS (
         SELECT parsed.id,
            parsed."birthYear",
            parsed."reasonForJoin",
            parsed."countryOriginId",
            parsed."immigrationId",
            parsed."currentCity",
            parsed."currentGovDistId",
            parsed."currentCountryId",
            parsed."ethnicityOther",
            parsed."immigrationOther",
            parsed.ulid_part,
            ( SELECT to_timestamp(inner_query.ts / 1000.0::double precision) AS to_timestamp
                   FROM ( SELECT ( SELECT sum((POSITION(("substring"(split_part(parsed.id, '_'::text, 2), i.i, 1)) IN ('0123456789ABCDEFGHJKMNPQRSTVWXYZ'::text)) - 1)::double precision * (32::double precision ^ (10 - i.i)::double precision)) AS sum
                                   FROM generate_series(1, 10) i(i)) AS ts) inner_query) AS ulid_timestamp,
            EXTRACT(year FROM ( SELECT to_timestamp(inner_query.ts / 1000.0::double precision) AS to_timestamp
                   FROM ( SELECT ( SELECT sum((POSITION(("substring"(split_part(parsed.id, '_'::text, 2), i.i, 1)) IN ('0123456789ABCDEFGHJKMNPQRSTVWXYZ'::text)) - 1)::double precision * (32::double precision ^ (10 - i.i)::double precision)) AS sum
                                   FROM generate_series(1, 10) i(i)) AS ts) inner_query)) AS "createdAt Year"
           FROM parsed
        ), joined_data AS (
         SELECT d.id,
            d.ulid_timestamp,
            d."createdAt Year",
            d."birthYear",
            NULL::text AS communities,
            c1.name AS "countryOrigin",
            c2.name AS "currentCountry",
            NULL::text AS "currentGovDist",
            NULL::text AS "currentCity",
            string_agg(DISTINCT ue.ethnicity, ', '::text) AS ethnicities,
            d."ethnicityOther",
            string_agg(DISTINCT us."identifyAs", ', '::text) AS "identifiesAs",
            i1.status AS immigration,
            d."immigrationOther",
            d."reasonForJoin"
           FROM decoded d
             LEFT JOIN "Country" c1 ON d."countryOriginId" = c1.id
             LEFT JOIN "Country" c2 ON d."currentCountryId" = c2.id
             LEFT JOIN "SurveyEthnicity" e1 ON d.id = e1."surveyId"
             LEFT JOIN "UserEthnicity" ue ON e1."ethnicityId" = ue.id
             LEFT JOIN "SurveySOG" s1 ON d.id = s1."surveyId"
             LEFT JOIN "UserSOGIdentity" us ON s1."sogId" = us.id
             LEFT JOIN "UserImmigration" i1 ON d."immigrationId" = i1.id
          GROUP BY d.id, d."birthYear", c1.name, c2.name, d."ethnicityOther", i1.status, d."immigrationOther", d."reasonForJoin", d.ulid_timestamp, d."createdAt Year"
        )
 SELECT joined_data.id,
    joined_data.ulid_timestamp,
    joined_data."createdAt Year",
    joined_data."birthYear",
    joined_data.communities,
    joined_data."countryOrigin",
    joined_data."currentCountry",
    joined_data."currentGovDist",
    joined_data."currentCity",
    joined_data.ethnicities,
    joined_data."ethnicityOther",
    joined_data."identifiesAs",
    joined_data.immigration,
    joined_data."immigrationOther",
    joined_data."reasonForJoin"
   FROM joined_data;

; -- Don't forget the semicolon after the CREATE VIEW statement
--------------------------------------
