-- Create the Capability Count View
-- 1. Create the Zipcode Capability Count View
DROP VIEW IF EXISTS public."ServicesCountByCategoryByStateByPostalCode";
CREATE OR REPLACE VIEW public."ServicesCountByCategoryByStateByPostalCode" AS
SELECT
    sc.category AS category,
    ol."postCode" AS postal_code,
    COALESCE(gd.name, 'N/A') AS state_province_name,
    c.name AS country_name,
    COUNT(DISTINCT (st.id, ol.street1))::integer AS service_count
FROM "OrgService" os
JOIN "Organization" o ON os."organizationId" = o.id
JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
JOIN "Country" c ON ol."countryId" = c.id
LEFT JOIN "GovDist" gd ON ol."govDistId" = gd.id
JOIN "OrgServiceTag" ost ON os.id = ost."serviceId"
JOIN "ServiceTag" st ON ost."tagId" = st.id
JOIN "ServiceCategory" sc ON st."primaryCategoryId" = sc.id
WHERE os.published IS TRUE AND os.deleted IS FALSE AND o.published IS TRUE AND o.deleted IS FALSE
GROUP BY sc.category, ol."postCode", gd.name, c.name;

-- 2. Create the Organization CSV Export View (Used by Published/Unpublished reports)
DROP VIEW IF EXISTS public.organizations_csv_export_view;
CREATE OR REPLACE VIEW public.organizations_csv_export_view AS
SELECT
    o.id,
    o.name AS "Organization Name",
    w.url AS "Organization Website",
    concat('https://app.inreach.org/org/', o.slug) AS "InReach Slug",
    concat('https://app.inreach.org/org/', o.slug, '/edit') AS "InReach Edit URL",
    o."createdAt",
    o."updatedAt",
    o."lastVerified",
    o.published,
    o.deleted,
    c.cca2 AS "countryCode"
FROM "Organization" o
LEFT JOIN "OrgWebsite" w ON o.id = w."organizationId" AND w."isPrimary" IS TRUE
LEFT JOIN "OrgLocation" ol ON o.id = ol."orgId" AND ol."primary" IS TRUE
LEFT JOIN "Country" c ON ol."countryId" = c.id;

-- 3. Create the Organizations with Review View (Used by Review reports)
DROP VIEW IF EXISTS public.organizations_with_review;
CREATE OR REPLACE VIEW public.organizations_with_review AS
SELECT
    o.id,
    o.name AS "Organization Name",
    w.url AS "Organization Website",
    concat('https://app.inreach.org/org/', o.slug) AS "InReach Slug",
    concat('https://app.inreach.org/org/', o.slug, '/edit') AS "InReach Edit URL",
    CASE WHEN COUNT(r.id) > 0 THEN 'Yes' ELSE 'No' END AS "has Reviews",
    o."createdAt",
    o."updatedAt",
    o."lastVerified",
    o.published,
    o.deleted,
    c.cca2 AS "countryCode"
FROM "Organization" o
LEFT JOIN "OrgWebsite" w ON o.id = w."organizationId" AND w."isPrimary" IS TRUE
LEFT JOIN "OrgLocation" ol ON o.id = ol."orgId" AND ol."primary" IS TRUE
LEFT JOIN "Country" c ON ol."countryId" = c.id
LEFT JOIN "OrgReview" r ON o.id = r."organizationId"
GROUP BY o.id, o.name, w.url, o.slug, o."createdAt", o."updatedAt", o."lastVerified", o.published, o.deleted, c.cca2;
