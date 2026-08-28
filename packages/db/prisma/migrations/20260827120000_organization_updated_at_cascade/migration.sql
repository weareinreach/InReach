-- Touches Organization.updatedAt whenever anything associated with that org - at any level (the
-- org itself, a location, a service, or any contact/hours/attribute/service-area record attached
-- to one of those) is inserted, updated, or deleted.
--
-- Kept deliberately separate from create_audit_entry()/audit_trail_enable()
-- (see 20230831221453_audit_log_fns) rather than folded into it: that function is schema-agnostic
-- (just snapshots whichever row changed, with zero relational awareness) and is applied to 87+
-- tables having nothing to do with organizations (Session, Country, Language, ...). This one needs
-- real per-table relational logic and only applies to the ~25 tables that are actually part of an
-- organization's hierarchy - mixing the two would put organization-specific branching inside a
-- function every audited table depends on.
--
-- Organization/OrgLocation/OrgService's OWN `updatedAt` columns are already maintained by
-- Prisma's `@updatedAt` on direct writes - this trigger only needs to run on everything BELOW/
-- ATTACHED to them.
CREATE OR REPLACE FUNCTION _touch_organizations(org_ids text[])
	RETURNS void VOLATILE
	LANGUAGE plpgsql
	AS $FUNC$
BEGIN
	IF org_ids IS NULL OR array_length(org_ids, 1) IS NULL THEN
		RETURN;
	END IF;
	UPDATE "Organization"
	SET "updatedAt" = NOW()
	WHERE id = ANY (org_ids);
END;
$FUNC$;

-- A ServiceArea belongs to exactly one of Organization/OrgLocation/OrgService in practice (each FK
-- column is individually @unique) - shared by ServiceArea's own trigger case below and by
-- ServiceAreaCountry/ServiceAreaDist, which are one hop further away (they reference a
-- ServiceArea's id, not an org/location/service directly).
CREATE OR REPLACE FUNCTION _service_area_organization_ids(service_area_id text)
	RETURNS text[] STABLE
	LANGUAGE plpgsql
	AS $FUNC$
DECLARE
	org_ids text[];
BEGIN
	SELECT ARRAY_REMOVE(ARRAY[
			sa."organizationId",
			ol."orgId",
			os."organizationId"
		], NULL)
	INTO org_ids
	FROM "ServiceArea" sa
	LEFT JOIN "OrgLocation" ol ON ol.id = sa."orgLocationId"
	LEFT JOIN "OrgService" os ON os.id = sa."orgServiceId"
	WHERE sa.id = service_area_id;
	RETURN COALESCE(org_ids, ARRAY[]::text[]);
END;
$FUNC$;

CREATE OR REPLACE FUNCTION touch_organization_updated_at()
	RETURNS TRIGGER
	LANGUAGE plpgsql
	AS $FUNC$
DECLARE
	r RECORD;
	org_ids text[] := ARRAY[]::text[];
BEGIN
	IF (TG_OP = 'DELETE') THEN
		r := OLD;
	ELSE
		r := NEW;
	END IF;

	CASE TG_TABLE_NAME
	-- Direct FK to Organization, own column non-nullable
	WHEN 'OrgLocation' THEN
		org_ids := ARRAY[r."orgId"];
	WHEN 'OrganizationPhone', 'OrganizationEmail', 'OrgReview', 'Report' THEN
		org_ids := ARRAY[r."organizationId"];

	-- Direct FK to Organization, own column nullable
	WHEN 'OrgService' THEN
		org_ids := ARRAY_REMOVE(ARRAY[r."organizationId"], NULL);

	-- "Polymorphic" leaf records: exactly one of org/location/service is set on the row itself
	WHEN 'OrgHours' THEN
		org_ids := ARRAY_REMOVE(ARRAY[
				r."organizationId",
				(SELECT "orgId" FROM "OrgLocation" WHERE id = r."orgLocId"),
				(SELECT "organizationId" FROM "OrgService" WHERE id = r."orgServiceId")
			], NULL);
	WHEN 'AttributeSupplement' THEN
		org_ids := ARRAY_REMOVE(ARRAY[
				r."organizationId",
				(SELECT "orgId" FROM "OrgLocation" WHERE id = r."locationId"),
				(SELECT "organizationId" FROM "OrgService" WHERE id = r."serviceId")
			], NULL);
	WHEN 'ServiceArea' THEN
		org_ids := ARRAY_REMOVE(ARRAY[
				r."organizationId",
				(SELECT "orgId" FROM "OrgLocation" WHERE id = r."orgLocationId"),
				(SELECT "organizationId" FROM "OrgService" WHERE id = r."orgServiceId")
			], NULL);
	WHEN 'OrgPhoto' THEN
		org_ids := ARRAY_REMOVE(ARRAY[
				r."orgId",
				(SELECT "orgId" FROM "OrgLocation" WHERE id = r."orgLocationId")
			], NULL);

	-- Content records with NO direct FK of their own - linked to an org/location/service via up to
	-- three separate join tables simultaneously. Touches every org currently linked, not just one,
	-- so editing the shared record's own content (e.g. a phone number's digits) is reflected
	-- everywhere it's actually used.
	WHEN 'OrgPhone' THEN
		org_ids := ARRAY(
			SELECT DISTINCT unnest(ARRAY_REMOVE(ARRAY[org_id], NULL)) FROM (
				SELECT "organizationId" AS org_id FROM "OrganizationPhone" WHERE "phoneId" = r.id
				UNION ALL
				SELECT ol."orgId" FROM "OrgLocationPhone" olp JOIN "OrgLocation" ol ON ol.id = olp."orgLocationId" WHERE olp."phoneId" = r.id
				UNION ALL
				SELECT os."organizationId" FROM "OrgServicePhone" osp JOIN "OrgService" os ON os.id = osp."serviceId" WHERE osp."orgPhoneId" = r.id
			) found_orgs
		);
	WHEN 'OrgEmail' THEN
		org_ids := ARRAY(
			SELECT DISTINCT unnest(ARRAY_REMOVE(ARRAY[org_id], NULL)) FROM (
				SELECT "organizationId" AS org_id FROM "OrganizationEmail" WHERE "orgEmailId" = r.id
				UNION ALL
				SELECT ol."orgId" FROM "OrgLocationEmail" ole JOIN "OrgLocation" ol ON ol.id = ole."orgLocationId" WHERE ole."orgEmailId" = r.id
				UNION ALL
				SELECT os."organizationId" FROM "OrgServiceEmail" ose JOIN "OrgService" os ON os.id = ose."serviceId" WHERE ose."orgEmailId" = r.id
			) found_orgs
		);
	WHEN 'OrgWebsite' THEN
		org_ids := ARRAY(
			SELECT DISTINCT unnest(ARRAY_REMOVE(ARRAY[org_id], NULL)) FROM (
				SELECT r."organizationId" AS org_id
				UNION ALL
				SELECT ol."orgId" FROM "OrgLocationWebsite" olw JOIN "OrgLocation" ol ON ol.id = olw."orgLocationId" WHERE olw."orgWebsiteId" = r.id
				UNION ALL
				SELECT os."organizationId" FROM "OrgServiceWebsite" osw JOIN "OrgService" os ON os.id = osw."serviceId" WHERE osw."orgWebsiteId" = r.id
			) found_orgs
		);
	WHEN 'OrgSocialMedia' THEN
		org_ids := ARRAY(
			SELECT DISTINCT unnest(ARRAY_REMOVE(ARRAY[org_id], NULL)) FROM (
				SELECT r."organizationId" AS org_id
				UNION ALL
				SELECT ol."orgId" FROM "OrgLocationSocialMedia" olsm JOIN "OrgLocation" ol ON ol.id = olsm."orgLocationId" WHERE olsm."socialMediaId" = r.id
			) found_orgs
		);

	-- Join tables: one hop to OrgLocation
	WHEN 'OrgLocationEmail', 'OrgLocationPhone', 'OrgLocationService', 'OrgLocationWebsite', 'OrgLocationSocialMedia' THEN
		org_ids := ARRAY_REMOVE(ARRAY[(SELECT "orgId" FROM "OrgLocation" WHERE id = r."orgLocationId")], NULL);

	-- Join tables: one hop to OrgService
	WHEN 'OrgServiceEmail', 'OrgServicePhone', 'OrgServiceWebsite', 'OrgServiceTag' THEN
		org_ids := ARRAY_REMOVE(ARRAY[(SELECT "organizationId" FROM "OrgService" WHERE id = r."serviceId")], NULL);

	-- Two hops: via ServiceArea
	WHEN 'ServiceAreaCountry', 'ServiceAreaDist' THEN
		org_ids := _service_area_organization_ids(r."serviceAreaId");

	ELSE
		org_ids := ARRAY[]::text[];
	END CASE;

	PERFORM _touch_organizations(org_ids);
	RETURN NULL;
END;
$FUNC$;

CREATE OR REPLACE FUNCTION organization_touch_enable(tablename regclass)
	RETURNS void VOLATILE
	SECURITY DEFINER
	LANGUAGE plpgsql
	AS $FUNC$
DECLARE
	statement_row text = '
        CREATE TRIGGER organization_touch_i_u_d
            AFTER INSERT OR UPDATE OR DELETE
            ON ' || tablename || '
            FOR EACH ROW
            EXECUTE PROCEDURE touch_organization_updated_at();';
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_trigger
		WHERE tgrelid = tablename AND tgname = 'organization_touch_i_u_d') THEN
		EXECUTE statement_row;
	END IF;
END;
$FUNC$;

CREATE OR REPLACE FUNCTION organization_touch_disable(tablename regclass)
	RETURNS void VOLATILE
	SECURITY DEFINER
	LANGUAGE plpgsql
	AS $FUNC$
DECLARE
	statement_row text = 'DROP TRIGGER IF EXISTS organization_touch_i_u_d on ' || tablename;
BEGIN
	EXECUTE statement_row;
END;
$FUNC$;

-- Apply to every table in the organization hierarchy
SELECT organization_touch_enable(to_regclass('public."OrgLocation"'));
SELECT organization_touch_enable(to_regclass('public."OrgService"'));
SELECT organization_touch_enable(to_regclass('public."OrganizationPhone"'));
SELECT organization_touch_enable(to_regclass('public."OrganizationEmail"'));
SELECT organization_touch_enable(to_regclass('public."OrgReview"'));
SELECT organization_touch_enable(to_regclass('public."Report"'));
SELECT organization_touch_enable(to_regclass('public."OrgHours"'));
SELECT organization_touch_enable(to_regclass('public."AttributeSupplement"'));
SELECT organization_touch_enable(to_regclass('public."ServiceArea"'));
SELECT organization_touch_enable(to_regclass('public."OrgPhoto"'));
SELECT organization_touch_enable(to_regclass('public."OrgPhone"'));
SELECT organization_touch_enable(to_regclass('public."OrgEmail"'));
SELECT organization_touch_enable(to_regclass('public."OrgWebsite"'));
SELECT organization_touch_enable(to_regclass('public."OrgSocialMedia"'));
SELECT organization_touch_enable(to_regclass('public."OrgLocationEmail"'));
SELECT organization_touch_enable(to_regclass('public."OrgLocationPhone"'));
SELECT organization_touch_enable(to_regclass('public."OrgLocationService"'));
SELECT organization_touch_enable(to_regclass('public."OrgLocationWebsite"'));
SELECT organization_touch_enable(to_regclass('public."OrgLocationSocialMedia"'));
SELECT organization_touch_enable(to_regclass('public."OrgServiceEmail"'));
SELECT organization_touch_enable(to_regclass('public."OrgServicePhone"'));
SELECT organization_touch_enable(to_regclass('public."OrgServiceWebsite"'));
SELECT organization_touch_enable(to_regclass('public."OrgServiceTag"'));
SELECT organization_touch_enable(to_regclass('public."ServiceAreaCountry"'));
SELECT organization_touch_enable(to_regclass('public."ServiceAreaDist"'));

-- Bring the leaf tables newly in scope for this feature into the existing generic audit trail too
-- (LocationAlert and SearchSynonym are deliberately NOT included anywhere in this migration -
-- neither has any relation to an Organization at all: LocationAlert is scoped by country/gov-dist,
-- SearchSynonym is a global term list - there is no owning org to resolve for either one).
SELECT audit_trail_enable(to_regclass('public."Report"'));
SELECT audit_trail_enable(to_regclass('public."OrgLocationWebsite"'));
SELECT audit_trail_enable(to_regclass('public."OrgLocationSocialMedia"'));
SELECT audit_trail_enable(to_regclass('public."OrgServiceWebsite"'));
