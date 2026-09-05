-- Content Search & Bulk Edit: service-level search infrastructure.
--
-- Adds the OrgService-level equivalent of Organization.attributeIds/serviceIds (materialized,
-- Gin-indexed arrays), and a trigram index on TranslationKey.text so org/service description
-- content becomes searchable the same way Organization.name already is.

-- 1. Materialized columns on OrgService
ALTER TABLE "OrgService"
ADD COLUMN IF NOT EXISTS "attributeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "tagIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Indexes
CREATE INDEX IF NOT EXISTS "OrgService_attributeIds_idx" ON "OrgService" USING GIN ("attributeIds");
CREATE INDEX IF NOT EXISTS "OrgService_tagIds_idx" ON "OrgService" USING GIN ("tagIds");

-- Description/name search index - same normalization as Organization_name_trgm_gin_idx
-- (public.immutable_unaccent already exists, created by 20260611000000_consolidated_v2_search).
CREATE INDEX IF NOT EXISTS "TranslationKey_text_trgm_gin_idx" ON "TranslationKey"
USING GIN (lower(public.immutable_unaccent(regexp_replace(text, '[^a-zA-Z0-9 ]', '', 'g'))) gin_trgm_ops);

-- 3. Backfill existing rows - triggers below only maintain these going forward.
UPDATE "OrgService" os SET "attributeIds" = COALESCE((
  SELECT ARRAY(SELECT DISTINCT "attributeId" FROM "AttributeSupplement" WHERE "serviceId" = os.id AND active = true)
), ARRAY[]::TEXT[]);

UPDATE "OrgService" os SET "tagIds" = COALESCE((
  SELECT ARRAY(SELECT DISTINCT "tagId" FROM "OrgServiceTag" WHERE "serviceId" = os.id AND active = true)
), ARRAY[]::TEXT[]);

-- 4. Extend the existing trigger functions to also maintain the new OrgService-level columns.
-- Both already have the service id in hand (NEW/OLD."serviceId") - no extra lookup needed.

CREATE OR REPLACE FUNCTION sync_org_attribute_ids() RETURNS TRIGGER AS $$
DECLARE
  v_org_id TEXT;
  v_service_id TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_org_id := COALESCE(
      OLD."organizationId",
      (SELECT "orgId" FROM "OrgLocation" WHERE id = OLD."locationId"),
      (SELECT "organizationId" FROM "OrgService" WHERE id = OLD."serviceId")
    );
    v_service_id := OLD."serviceId";
  ELSE
    v_org_id := COALESCE(
      NEW."organizationId",
      (SELECT "orgId" FROM "OrgLocation" WHERE id = NEW."locationId"),
      (SELECT "organizationId" FROM "OrgService" WHERE id = NEW."serviceId")
    );
    v_service_id := NEW."serviceId";
  END IF;

  IF v_org_id IS NOT NULL THEN
    UPDATE "Organization"
    SET "attributeIds" = ARRAY(
      SELECT DISTINCT asup."attributeId"
      FROM "AttributeSupplement" asup
      LEFT JOIN "OrgLocation" loc ON asup."locationId" = loc.id
      LEFT JOIN "OrgService" os ON asup."serviceId" = os.id
      WHERE (asup."organizationId" = v_org_id OR loc."orgId" = v_org_id OR os."organizationId" = v_org_id)
        AND asup.active = true
    ) WHERE id = v_org_id;
  END IF;

  IF v_service_id IS NOT NULL THEN
    UPDATE "OrgService"
    SET "attributeIds" = ARRAY(
      SELECT DISTINCT "attributeId"
      FROM "AttributeSupplement"
      WHERE "serviceId" = v_service_id AND active = true
    ) WHERE id = v_service_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_org_service_ids() RETURNS TRIGGER AS $$
DECLARE
  v_org_id TEXT;
  v_service_id TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_service_id := OLD."serviceId";
  ELSE
    v_service_id := NEW."serviceId";
  END IF;

  SELECT "organizationId" INTO v_org_id FROM "OrgService" WHERE id = v_service_id;

  IF v_org_id IS NOT NULL THEN
    UPDATE "Organization" SET "serviceIds" = ARRAY(
      SELECT DISTINCT ost."tagId"
      FROM "OrgServiceTag" ost
      JOIN "OrgService" os ON ost."serviceId" = os.id
      WHERE os."organizationId" = v_org_id AND ost.active = true
    ) WHERE id = v_org_id;
  END IF;

  IF v_service_id IS NOT NULL THEN
    UPDATE "OrgService"
    SET "tagIds" = ARRAY(
      SELECT DISTINCT "tagId"
      FROM "OrgServiceTag"
      WHERE "serviceId" = v_service_id AND active = true
    ) WHERE id = v_service_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers already exist (created by 20260611000000_consolidated_v2_search) and fire on the same
-- tables/events - CREATE OR REPLACE FUNCTION above is sufficient, no need to re-create them.
