-- Update View

CREATE OR REPLACE VIEW public.attributes_by_category AS
SELECT ac.id AS "categoryId",
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
	asds.definition AS "dataSchema"
FROM "AttributeCategory" ac
JOIN "AttributeToCategory" atc ON atc."categoryId" = ac.id
JOIN "Attribute" a ON a.id = atc."attributeId"
LEFT JOIN "AttributeSupplementDataSchema" asds ON asds.id = a."requiredSchemaId"
WHERE a.active = true
		AND ac.active = true
ORDER BY ac.tag,
	a.tag;

