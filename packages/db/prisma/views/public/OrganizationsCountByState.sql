SELECT
  c.name AS country,
  gd.name AS state_or_territory,
  count(DISTINCT os.id) AS organization_count
FROM
  (
    (
      (
        "Organization" os
        JOIN "OrgLocation" ol ON ((os.id = ol."orgId"))
      )
      LEFT JOIN "GovDist" gd ON ((ol."govDistId" = gd.id))
    )
    JOIN "Country" c ON ((ol."countryId" = c.id))
  )
WHERE
  (os.published IS TRUE)
GROUP BY
  c.name,
  gd.name
ORDER BY
  c.name,
  gd.name;