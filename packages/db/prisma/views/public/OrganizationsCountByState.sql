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
