-- Adds a human-readable "status" column to organizations_csv_export_view - "Published" or the
-- unpublishedReason label. Keeps `published`/`deleted` in the view too (the two CSV download handlers
-- still filter on the raw boolean), but the handlers' own SELECT lists now pull `status` instead of the
-- raw `published` value for what actually appears in the downloaded CSV - see
-- docs/DataPortal/2026-Redesign/unpublished-status.md ("Same merge on the Downloads tab").

DROP VIEW IF EXISTS "organizations_csv_export_view";

CREATE VIEW "organizations_csv_export_view" AS
SELECT o.id,
    o.name AS "Organization Name",
    COALESCE(( SELECT ow.url
            FROM "OrgWebsite" ow
            WHERE ow."organizationId" = o.id AND ow."isPrimary" = true
          LIMIT 1), ( SELECT ow.url
            FROM "OrgWebsite" ow
            WHERE ow."organizationId" = o.id
          LIMIT 1)) AS "Organization Website",
    concat('https://app.inreach.org/org/', o.slug) AS "InReach Slug",
    concat('https://app.inreach.org/org/', o.slug, '/edit') AS "InReach Edit URL",
    o."createdAt",
    o."updatedAt",
    o."lastVerified",
    o.published,
    o.deleted,
    CASE
        WHEN o.published THEN 'Published'
        ELSE
            CASE o."unpublishedReason"
                WHEN 'NEW' THEN 'New'
                WHEN 'IN_PROGRESS' THEN 'In progress'
                WHEN 'WAITING' THEN 'Waiting to hear back'
                WHEN 'INACTIVE' THEN 'Inactive'
                WHEN 'UNAFFIRMING' THEN 'Unaffirming'
                ELSE NULL
            END
    END AS status,
    COALESCE(( SELECT c.name
            FROM "OrgLocation" ol
              JOIN "Country" c ON ol."countryId" = c.id
            WHERE ol."orgId" = o.id
          LIMIT 1), NULL::text) AS "countryCode"
   FROM "Organization" o
  WHERE o.deleted = false
ORDER BY (
        CASE
            WHEN o."lastVerified" IS NULL THEN 0
            ELSE 1
        END), o."lastVerified";
