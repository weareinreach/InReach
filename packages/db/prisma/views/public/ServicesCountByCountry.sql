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
