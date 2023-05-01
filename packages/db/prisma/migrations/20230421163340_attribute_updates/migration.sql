-- Add field to specify how a variant badge should render
-- CreateEnum
DO $$
BEGIN
IF NOT EXISTS
		(SELECT 1
			from pg_type
			WHERE typname = 'BadgeVariants' ) THEN
CREATE TYPE "BadgeVariants" AS ENUM ('COMMUNITY', 'SERVICE', 'LEADER', 'ATTRIBUTE');

END IF;

END $$;

-- AlterTable

ALTER TABLE "AttributeCategory" ADD COLUMN IF NOT EXISTS "renderVariant" "BadgeVariants";

-- Add "categoryDisplay" column & filter "active" on category

CREATE
OR REPLACE VIEW public.attributes_by_category AS
SELECT ac.id AS "categoryId",
	ac.tag AS "categoryName",
	a.id AS "attributeId",
	a.tag AS "attributeName",
	a."tsKey" AS "attributeKey",
	a."tsNs" AS "attributeNs",
	a.icon,
	a."requireText",
	a."requireLanguage",
	a."requireCountry",
	a."requireBoolean",
	a."requireData",
	ac."name" AS "categoryDisplay",
	ac."renderVariant" AS "badgeRender",
	a."iconBg" AS "iconBg"
FROM "AttributeCategory" ac
JOIN "AttributeToCategory" atc ON atc."categoryId" = ac.id
JOIN "Attribute" a ON a.id = atc."attributeId"
WHERE a.active = true
		AND ac.active = true
ORDER BY ac.tag,
	a.tag;

