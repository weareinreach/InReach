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
