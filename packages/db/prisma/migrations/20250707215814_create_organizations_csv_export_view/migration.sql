-- CreateEnum
-- CreateTable (if Prisma generated any)

-- CreateIndex (if Prisma generated any, or was commented out like the previous one)

DROP VIEW IF EXISTS "organizations_csv_export_view";

-- Add the CREATE VIEW statement
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
    COALESCE(( SELECT c.name
            FROM "OrgLocation" ol
              JOIN "Country" c ON ol."countryId" = c.id
            WHERE ol."orgId" = o.id
          LIMIT 1), NULL::text) AS "countryCode"
   FROM "Organization" o
  WHERE o.deleted = false;
