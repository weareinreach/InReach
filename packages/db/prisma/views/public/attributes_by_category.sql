SELECT
	ac.id AS "categoryId",
	ac.tag AS "categoryName",
	a.id AS "attributeId",
	a.tag AS "attributeName",
	a."tsKey" AS "attributeKey",
	a."tsNs" AS "attributeNs",
	a."icon",
	a."requireText",
	a."requireLanguage",
	a."requireCountry",
	a."requireBoolean",
	a."requireData"
FROM
	(
		(
			"AttributeCategory" ac
			JOIN "AttributeToCategory" atc ON ((atc."categoryId" = ac.id))
		)
		JOIN "Attribute" a ON ((a.id = atc."attributeId"))
	)
WHERE
	(a.active = TRUE)
ORDER BY
	ac.tag,
	a.tag;