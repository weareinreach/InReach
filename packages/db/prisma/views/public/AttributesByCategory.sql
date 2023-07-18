SELECT
  ac.id AS "categoryId",
  ac.tag AS "categoryName",
  ac.name AS "categoryDisplay",
  a.id AS "attributeId",
  a.tag AS "attributeName",
  a."tsKey" AS "attributeKey",
  a."tsNs" AS "attributeNs",
  a.icon,
  a."iconBg",
  ac."renderVariant" AS "badgeRender",
  a."requireText",
  a."requireLanguage",
  a."requireGeo",
  a."requireBoolean",
  a."requireData",
  asds.definition AS "dataSchema",
  tkey."interpolationValues",
  asds.tag AS "dataSchemaName"
FROM
  (
    (
      (
        (
          "AttributeCategory" ac
          JOIN "AttributeToCategory" atc ON ((atc."categoryId" = ac.id))
        )
        JOIN "Attribute" a ON ((a.id = atc."attributeId"))
      )
      LEFT JOIN "AttributeSupplementDataSchema" asds ON ((asds.id = a."requiredSchemaId"))
    )
    LEFT JOIN "TranslationKey" tkey ON ((tkey.key = a."tsKey"))
  )
WHERE
  (
    (a.active = TRUE)
    AND (ac.active = TRUE)
  )
ORDER BY
  ac.tag,
  a.tag;