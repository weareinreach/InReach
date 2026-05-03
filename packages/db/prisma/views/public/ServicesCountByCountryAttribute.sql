SELECT
  attr.name AS "Attribute",
  count(
    DISTINCT CASE
      WHEN (c.id = 'ctry_01GW2HHDK9M26M80SG63T21SVH' :: text) THEN os.id
      ELSE NULL :: text
    END
  ) AS "United States",
  count(
    DISTINCT CASE
      WHEN (c.id = 'ctry_01GW2HHDKAWXWYHAAESAA5HH94' :: text) THEN os.id
      ELSE NULL :: text
    END
  ) AS "Canada",
  count(
    DISTINCT CASE
      WHEN (c.id = 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9' :: text) THEN os.id
      ELSE NULL :: text
    END
  ) AS "Mexico",
  count(
    DISTINCT CASE
      WHEN (
        c.id <> ALL (
          ARRAY ['ctry_01GW2HHDK9M26M80SG63T21SVH'::text, 'ctry_01GW2HHDKAWXWYHAAESAA5HH94'::text, 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9'::text]
        )
      ) THEN os.id
      ELSE NULL :: text
    END
  ) AS "Other"
FROM
  (
    (
      (
        (
          (
            "Attribute" attr
            LEFT JOIN "AttributeSupplement" a ON ((a."attributeId" = attr.id))
          )
          LEFT JOIN "OrgService" os ON (
            (
              (a."serviceId" = os.id)
              AND (os.published IS TRUE)
            )
          )
        )
        LEFT JOIN "OrgLocationService" ols ON ((os.id = ols."serviceId"))
      )
      LEFT JOIN "OrgLocation" ol ON ((ols."orgLocationId" = ol.id))
    )
    LEFT JOIN "Country" c ON ((ol."countryId" = c.id))
  )
WHERE
  (
    attr.id = ANY (
      ARRAY ['attr_01GW2HHFVN72D7XEBZZJXCJQXQ'::text, 'attr_01GW2HHFVPCVX8F3B7M30ZJEHW'::text, 'attr_01GW2HHFVPJERY0GS9D7F56A23'::text, 'attr_01GW2HHFVPSYBCYF37B44WP6CZ'::text, 'attr_01GW2HHFVPTK9555WHJHDBDA2J'::text, 'attr_01GW2HHFVQ7SYGD3KM8WP9X50B'::text, 'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F'::text, 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW'::text, 'attr_01GW2HHFVQEFWW42MBAD64BWXZ'::text, 'attr_01GW2HHFVQVEGH6W3A2ANH1QZE'::text, 'attr_01GW2HHFVQX4M8DY1FSAYSJSSK'::text, 'attr_01GW2HHFVRMQFJ9AMA633SQQGV'::text, 'attr_01H273DMQ22TVP3RA36M1XWFBA'::text, 'attr_01H273ETEX43K0BR6FG3G7MZ4S'::text, 'attr_01H273FCJ8NNG1T1BV300CN702'::text, 'attr_01H273FPTCFKTVBNK158HE9M42'::text, 'attr_01H273G39A14TGHT4DA1T0DW5M'::text]
    )
  )
GROUP BY
  attr.name
ORDER BY
  attr.name;