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
