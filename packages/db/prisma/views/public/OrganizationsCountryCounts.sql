SELECT
  count(
    CASE
      WHEN (
        distinct_orgs."countryId" = 'ctry_01GW2HHDK9M26M80SG63T21SVH' :: text
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS "United States",
  count(
    CASE
      WHEN (
        distinct_orgs."countryId" = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' :: text
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS "Canada",
  count(
    CASE
      WHEN (
        distinct_orgs."countryId" = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' :: text
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS "Mexico",
  count(
    CASE
      WHEN (
        distinct_orgs."countryId" <> ALL (
          ARRAY ['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text]
        )
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS "Other"
FROM
  (
    SELECT
      DISTINCT ON (o.id, ol."countryId") o.id AS org_id,
      ol."countryId"
    FROM
      (
        "Organization" o
        JOIN "OrgLocation" ol ON ((o.id = ol."orgId"))
      )
    WHERE
      (o.published IS TRUE)
    ORDER BY
      o.id,
      ol."countryId"
  ) distinct_orgs;