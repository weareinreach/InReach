SELECT
  'Published Orgs in California' :: text AS category,
  count(DISTINCT o.id) AS count
FROM
  (
    "Organization" o
    JOIN "OrgLocation" ol ON ((o.id = ol."orgId"))
  )
WHERE
  (
    (o.published IS TRUE)
    AND (
      ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1' :: text
    )
  )
UNION
ALL
SELECT
  'Published Services in California' :: text AS category,
  count(os.id) AS count
FROM
  (
    (
      "OrgService" os
      JOIN "OrgLocationService" ols ON ((os.id = ols."serviceId"))
    )
    JOIN "OrgLocation" ol ON ((ols."orgLocationId" = ol.id))
  )
WHERE
  (
    (os.published IS TRUE)
    AND (
      ol."govDistId" = 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1' :: text
    )
  );