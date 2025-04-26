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
