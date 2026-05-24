-- V2 Combined Relevance Search Draft
-- Use this in pgAdmin to test the weighted logic manually.
-- Note: This reflects the Phase 1 MVP (Distance + Priority + Verified).

-- Replace placeholders like :lon, :lat, and :radius with test values.
-- Radius for 50 miles is approx 80467 meters.

WITH points AS (
    SELECT
        ST_Transform(ST_Point(-118.2437, 34.0522, 4326), 3857) AS meters, -- Example: LA
        ST_Point(-118.2437, 34.0522, 4326) AS degrees
),
candidates AS (
    SELECT
        org.id,
        org.slug,
        org."lastVerified",
        MIN(ROUND(ST_Distance(ST_Transform(loc.geo, 3857), (SELECT meters FROM points))::int)) AS distance
    FROM "Organization" org
    INNER JOIN "OrgLocation" loc ON org.id = loc."orgId"
    WHERE ST_DWithin(ST_Transform(loc.geo, 3857), (SELECT meters FROM points), 80467) -- 50 miles
      AND org.published
      AND NOT org.deleted
    GROUP BY org.id, org.slug, org."lastVerified"
),
scored_results AS (
    SELECT
        c.*,
        -- 1. DISTANCE DECAY (Dampened Reciprocal)
        -- 1.0 / (1.0 + (distance / dampener))
        (1.0 / (1.0 + (c.distance / 1000.0))) AS dist_score,

        -- 2. PRIORITY BOOST (Example: User set 'BIPOC' as Priority #1)
        -- Rank 1 = 1000pts per searchConfig.ts
        (CASE WHEN EXISTS (
            SELECT 1 FROM "AttributeSupplement" asup
            INNER JOIN "Attribute" a ON asup."attributeId" = a.id
            WHERE asup."organizationId" = c.id
              AND a.tag = 'bipoc'
              AND asup.active
        ) THEN 1000 ELSE 0 END) AS priority_score,

        -- 3. VERIFIED BONUS (500pts)
        (CASE WHEN c."lastVerified" IS NOT NULL THEN 500 ELSE 0 END) AS verified_score
    FROM candidates c
)
SELECT
    *,
    (dist_score + priority_score + verified_score) as relevance_score
FROM scored_results
ORDER BY
    relevance_score DESC,
    -- DETERMINISTIC TIE BREAKERS
    distance ASC,
    CASE WHEN "lastVerified" IS NOT NULL THEN 0 ELSE 1 END ASC,
    slug ASC
LIMIT 25;
