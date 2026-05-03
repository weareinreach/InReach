WITH tag_with_trans AS (
  SELECT
    st.id,
    st."primaryCategoryId",
    st."tsKey",
    CASE
      WHEN (
        (st."tsKey" ~~* '%.trans-%' :: text)
        OR (
          st.id = ANY (
            ARRAY ['svtg_01GW2HHFBQ02KJQ7E5NPM3ERNE'::text, 'svtg_01GW2HHFBR506BA0ZA7XZWX23Q'::text, 'svtg_01GW2HHFBSBVW6KJACB43FTFNQ'::text, 'svtg_01GW2HHFBSZJ7ZQD3AVMKQK83N'::text, 'svtg_01GW2HHFBSG3BES4BKSW269M8K'::text, 'svtg_01GW2HHFBS5YQWBD8N2V56X5X0'::text, 'svtg_01HAD647BVMT10DWEXFG1EFM9J'::text, 'svtg_01GW2HHFBSPTXA7Q4W5RKFP53W'::text, 'svtg_01GW2HHFBQ817GKC3K6D6JGMVC'::text, 'svtg_01GW2HHFBQNARDK4H2W30GC1QR'::text, 'svtg_01GW2HHFBRB8R4AQVR2FYE72EC'::text, 'svtg_01GW2HHFBS72MEA9GWN7FWYWQA'::text]
          )
        )
      ) THEN TRUE
      ELSE false
    END AS is_trans_focused
  FROM
    "ServiceTag" st
),
categorized AS (
  SELECT
    CASE
      WHEN twt.is_trans_focused THEN 'Trans Focused Services' :: text
      ELSE sc.category
    END AS category,
    os.id AS service_id,
    c.id AS country_id
  FROM
    (
      (
        (
          (
            (
              (
                tag_with_trans twt
                JOIN "ServiceCategory" sc ON ((twt."primaryCategoryId" = sc.id))
              )
              JOIN "OrgServiceTag" ost ON ((ost."tagId" = twt.id))
            )
            JOIN "OrgService" os ON (
              (
                (os.id = ost."serviceId")
                AND (os.published IS TRUE)
              )
            )
          )
          JOIN "OrgLocationService" ols ON ((os.id = ols."serviceId"))
        )
        JOIN "OrgLocation" ol ON ((ols."orgLocationId" = ol.id))
      )
      JOIN "Country" c ON ((ol."countryId" = c.id))
    )
  UNION
  ALL
  SELECT
    'Trans Focused Services' :: text AS category,
    os.id AS service_id,
    c.id AS country_id
  FROM
    (
      (
        (
          (
            (
              (
                tag_with_trans twt
                JOIN "ServiceCategory" sc ON ((twt."primaryCategoryId" = sc.id))
              )
              JOIN "OrgServiceTag" ost ON ((ost."tagId" = twt.id))
            )
            JOIN "OrgService" os ON (
              (
                (os.id = ost."serviceId")
                AND (os.published IS TRUE)
              )
            )
          )
          JOIN "OrgLocationService" ols ON ((os.id = ols."serviceId"))
        )
        JOIN "OrgLocation" ol ON ((ols."orgLocationId" = ol.id))
      )
      JOIN "Country" c ON ((ol."countryId" = c.id))
    )
  WHERE
    (twt.is_trans_focused = TRUE)
)
SELECT
  categorized.category AS "Service Category",
  count(DISTINCT categorized.service_id) FILTER (
    WHERE
      (
        categorized.country_id = 'ctry_01GW2HHDK9M26M80SG63T21SVH' :: text
      )
  ) AS "United States",
  count(DISTINCT categorized.service_id) FILTER (
    WHERE
      (
        categorized.country_id = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' :: text
      )
  ) AS "Canada",
  count(DISTINCT categorized.service_id) FILTER (
    WHERE
      (
        categorized.country_id = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' :: text
      )
  ) AS "Mexico",
  count(DISTINCT categorized.service_id) FILTER (
    WHERE
      (
        categorized.country_id <> ALL (
          ARRAY ['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text]
        )
      )
  ) AS "Other"
FROM
  categorized
GROUP BY
  categorized.category
ORDER BY
  categorized.category;