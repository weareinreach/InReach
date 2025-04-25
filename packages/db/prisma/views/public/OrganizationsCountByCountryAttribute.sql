
SELECT
  a.name AS attribute,
  COUNT(CASE WHEN ol."countryId" = 'ctry_01GW2HHDK9M26M80SG63T21SVH' THEN 1 END) AS "United States",
  COUNT(CASE WHEN ol."countryId" = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' THEN 1 END) AS "Canada",
  COUNT(CASE WHEN ol."countryId" = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' THEN 1 END) AS "Mexico",
  COUNT(CASE WHEN ol."countryId" NOT IN (
    'ctry_01GW2HHDK9M26M80SG63T21SVH',
    'ctry_01GW2HHDKAWXWYHAAESAA5HH94',
    'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'
  ) THEN 1 END) AS "Other"
FROM "Organization" o
JOIN "OrgLocation" ol ON o.id = ol."orgId"
JOIN "AttributeSupplement" ats ON ats."organizationId" = o.id
JOIN "Attribute" a ON ats."attributeId" = a.id
WHERE o.published IS TRUE
  AND a.id IN (
    'attr_01GW2HHFVN3JX2J7REFFT5NAMS',  -- Black-led
    'attr_01GW2HHFVN3RYX9JMXDZSQZM70',  -- Transgender-led
    'attr_01GW2HHFVNHMF72WHVKRF6W4TA',  -- Immigrant-led
    'attr_01GW2HHFVNPKMHYK12DDRVC1VJ',  -- BIPOC-led
    'attr_01H273GW0GN44GZ5RK1F51Z1QZ',  -- Women-led
    'attr_01J1DF9MFN8QWFXKYR7XFJANSF'   -- LGBTQ+ Led
  )
GROUP BY a.name
ORDER BY a.name;
