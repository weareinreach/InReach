-- CreateEnum
-- CreateTable (if Prisma generated any)

-- CreateIndex (if Prisma generated any, or was commented out like the previous one)

DROP VIEW IF EXISTS "organizations_with_review";

-- Create a view to list organizations with review information and specific sorting
CREATE VIEW "organizations_with_review" AS
SELECT
    o.id,
    o.name AS "Organization Name",
    COALESCE((
        SELECT ow.url
        FROM "OrgWebsite" ow
        WHERE ow."organizationId" = o.id AND ow."isPrimary" = true
        LIMIT 1
    ), (
        SELECT ow.url
        FROM "OrgWebsite" ow
        WHERE ow."organizationId" = o.id
        LIMIT 1
    )) AS "Organization Website",
    -- Corrected URL generation for InReach Slug
    concat('https://app.inreach.org/org/', o.slug) AS "InReach Slug",
    -- Corrected URL generation for InReach Edit URL
    concat('https://app.inreach.org/org/', o.slug, '/edit') AS "InReach Edit URL",
    -- Determine if the organization has one or more reviews
    CASE
        WHEN EXISTS (SELECT 1 FROM "OrgReview" orv WHERE orv."organizationId" = o.id) THEN 'Yes'
        ELSE NULL
    END AS "has Reviews",
    o."createdAt",
    o."updatedAt",
    o."lastVerified",
    o.published,
    o.deleted,
    COALESCE((
        SELECT c.name
        FROM "OrgLocation" ol
        JOIN "Country" c ON ol."countryId" = c.id
        WHERE ol."orgId" = o.id
        LIMIT 1
    ), NULL::text) AS "countryCode"
FROM
    "Organization" o
WHERE
    o.deleted = false
    -- Filter to include only organizations that have at least one review
    AND (EXISTS ( SELECT 1 FROM "OrgReview" orv WHERE orv."organizationId" = o.id))
ORDER BY
    o.published DESC, -- Sort by published status (true values first)
    "Organization Website" ASC, -- Then by organization website alphabetically
    CASE
        WHEN o."lastVerified" IS NULL THEN 0 -- Then by lastVerified, with NULLs appearing first
        ELSE 1
    END,
    o."lastVerified" ASC; -- Finally, by the actual lastVerified date (oldest to newest)
