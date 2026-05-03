SELECT
  a.name AS attribute,
  count(
    CASE
      WHEN (
        ol."countryId" = 'ctry_01GW2HHDK9M26M80SG63T21SVH' :: text
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS "United States",
  count(
    CASE
      WHEN (
        ol."countryId" = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' :: text
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS "Canada",
  count(
    CASE
      WHEN (
        ol."countryId" = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' :: text
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS "Mexico",
  count(
    CASE
      WHEN (
        ol."countryId" <> ALL (
          ARRAY ['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text]
        )
      ) THEN 1
      ELSE NULL :: integer
    END
  ) AS "Other"
FROM
  (
    (
      (
        "Organization" o
        JOIN "OrgLocation" ol ON ((o.id = ol."orgId"))
      )
      JOIN "AttributeSupplement" ats ON ((ats."organizationId" = o.id))
    )
    JOIN "Attribute" a ON ((ats."attributeId" = a.id))
  )
WHERE
  (
    (o.published IS TRUE)
    AND (
      a.id = ANY (
        ARRAY ['attr_01GW2HHFVN3JX2J7REFFT5NAMS'::text, 'attr_01GW2HHFVN3RYX9JMXDZSQZM70'::text, 'attr_01GW2HHFVNHMF72WHVKRF6W4TA'::text, 'attr_01GW2HHFVNPKMHYK12DDRVC1VJ'::text, 'attr_01H273GW0GN44GZ5RK1F51Z1QZ'::text, 'attr_01J1DF9MFN8QWFXKYR7XFJANSF'::text]
      )
    )
  )
GROUP BY
  a.name
ORDER BY
  a.name;