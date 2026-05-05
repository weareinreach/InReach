SELECT
  count(
    CASE
      WHEN (c.id = 'ctry_01GW2HHDK9M26M80SG63T21SVH' :: text) THEN 1
      ELSE NULL :: integer
    END
  ) AS "United States",
  count(
    CASE
      WHEN (c.id = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' :: text) THEN 1
      ELSE NULL :: integer
    END
  ) AS "Canada",
  count(
    CASE
      WHEN (c.id = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' :: text) THEN 1
      ELSE NULL :: integer
    END
  ) AS "Mexico",
  count(
    CASE
      WHEN (
        c.id <> ALL (
          ARRAY ['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text]
        )
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS "Other"
FROM
  (
    (
      SELECT
        DISTINCT os.id,
        ol."countryId"
      FROM
        (
          (
            "OrgService" os
            JOIN "OrgLocationService" ols ON ((os.id = ols."serviceId"))
          )
          JOIN "OrgLocation" ol ON ((ols."orgLocationId" = ol.id))
        )
      WHERE
        (os.published IS TRUE)
    ) distinct_services
    JOIN "Country" c ON ((distinct_services."countryId" = c.id))
  );