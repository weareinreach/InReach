CREATE OR REPLACE VIEW "ServicesCountByCategoryByStateByCountry" AS
SELECT
    c.name AS country_name,
    gd.name AS state_province_name,
    sc.category,
    COUNT(DISTINCT os.id) AS service_count
FROM "OrgService" os
JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
LEFT JOIN "GovDist" gd ON ol."govDistId" = gd.id
JOIN "Country" c ON ol."countryId" = c.id
JOIN "OrgServiceTag" ost ON os.id = ost."serviceId"
JOIN "ServiceTag" st ON ost."tagId" = st.id
JOIN "ServiceCategory" sc ON st."primaryCategoryId" = sc.id
WHERE os.published IS TRUE
GROUP BY
    c.name,
    gd.name,
    sc.category
ORDER BY
    c.name,
    gd.name,
    sc.category;
