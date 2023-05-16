-- DropView

DROP VIEW attributes_by_category;

-- AlterEnum
DO $$
BEGIN
IF EXISTS(SELECT 1 FROM pg_type WHERE typname = 'BadgeVariants') THEN


ALTER TYPE "BadgeVariants" RENAME TO "AttributeRender";
END IF;
END$$;


ALTER TYPE "AttributeRender" ADD VALUE IF NOT EXISTS 'LIST';

-- AlterTable

ALTER TABLE "AttributeCategory"
ALTER COLUMN "renderVariant" TYPE "AttributeRender";


ALTER TABLE "Attribute" RENAME COLUMN "requireCountry" to "requireGeo";

-- CreateView

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
	a."requireData"
FROM "AttributeCategory" ac
JOIN "AttributeToCategory" atc ON atc."categoryId" = ac.id
JOIN "Attribute" a ON a.id = atc."attributeId"
WHERE a.active = true
		AND ac.active = true
ORDER BY ac.tag,
	a.tag;

