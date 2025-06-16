
WITH tag_with_trans AS (
  SELECT
    st.id,
    st."primaryCategoryId",
    st."tsKey",
    CASE
      WHEN st."tsKey" ILIKE '%.trans-%'
           OR st.id IN (
              'svtg_01GW2HHFBQ02KJQ7E5NPM3ERNE',
              'svtg_01GW2HHFBR506BA0ZA7XZWX23Q',
              'svtg_01GW2HHFBSBVW6KJACB43FTFNQ',
              'svtg_01GW2HHFBSZJ7ZQD3AVMKQK83N',
              'svtg_01GW2HHFBSG3BES4BKSW269M8K',
              'svtg_01GW2HHFBS5YQWBD8N2V56X5X0',
              'svtg_01HAD647BVMT10DWEXFG1EFM9J',
              'svtg_01GW2HHFBSPTXA7Q4W5RKFP53W',
              'svtg_01GW2HHFBQ817GKC3K6D6JGMVC',
              'svtg_01GW2HHFBQNARDK4H2W30GC1QR',
              'svtg_01GW2HHFBRB8R4AQVR2FYE72EC',
              'svtg_01GW2HHFBS72MEA9GWN7FWYWQA'
           )
        THEN TRUE ELSE FALSE
    END AS is_trans_focused
  FROM "ServiceTag" st
),
categorized AS (
  SELECT
    CASE
      WHEN twt.is_trans_focused THEN 'Trans Focused Services'
      ELSE sc.category
    END AS category,
    os.id AS service_id,
    c.id AS country_id
  FROM tag_with_trans twt
  JOIN "ServiceCategory" sc ON twt."primaryCategoryId" = sc.id
  JOIN "OrgServiceTag" ost ON ost."tagId" = twt.id
  JOIN "OrgService" os ON os.id = ost."serviceId" AND os.published IS TRUE
  JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
  JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
  JOIN "Country" c ON ol."countryId" = c.id

  UNION ALL

  SELECT
    'Trans Focused Services' AS category,
    os.id AS service_id,
    c.id AS country_id
  FROM tag_with_trans twt
  JOIN "ServiceCategory" sc ON twt."primaryCategoryId" = sc.id
  JOIN "OrgServiceTag" ost ON ost."tagId" = twt.id
  JOIN "OrgService" os ON os.id = ost."serviceId" AND os.published IS TRUE
  JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
  JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
  JOIN "Country" c ON ol."countryId" = c.id
  WHERE twt.is_trans_focused = TRUE
)
SELECT
  category AS "Service Category",
  COUNT(DISTINCT service_id) FILTER (WHERE country_id = 'ctry_01GW2HHDK9M26M80SG63T21SVH') AS "United States",
  COUNT(DISTINCT service_id) FILTER (WHERE country_id = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94') AS "Canada",
  COUNT(DISTINCT service_id) FILTER (WHERE country_id = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9') AS "Mexico",
  COUNT(DISTINCT service_id) FILTER (
    WHERE country_id NOT IN (
      'ctry_01GW2HHDK9M26M80SG63T21SVH',
      'ctry_01GW2HHDKAWXWYHAAESAA5HH94',
      'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'
    )
  ) AS "Other"
FROM categorized
GROUP BY category
ORDER BY category;

