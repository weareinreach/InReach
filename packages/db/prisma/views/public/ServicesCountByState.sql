 SELECT c.name AS country,
    gd.name AS state_or_territory,
    count(os.id) AS service_count
   FROM "OrgService" os
     JOIN "OrgLocationService" ols ON os.id = ols."serviceId"
     JOIN "OrgLocation" ol ON ols."orgLocationId" = ol.id
     LEFT JOIN "GovDist" gd ON ol."govDistId" = gd.id
     JOIN "Country" c ON ol."countryId" = c.id
  WHERE os.published IS TRUE
  GROUP BY c.name, gd.name
  ORDER BY c.name, gd.name;
