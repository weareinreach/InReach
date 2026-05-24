-- DRAFT MIGRATION: GIN Indexes for Search V2
-- These indexes optimize "Match Any" (OR) lookups on service and attribute arrays.

-- 1. If we denormalize tags into an array on the Organization model (Recommended for Speed)
-- ALTER TABLE "Organization" ADD COLUMN "serviceIds" TEXT[];
-- ALTER TABLE "Organization" ADD COLUMN "attributeIds" TEXT[];

-- 2. Create the GIN Indexes
-- GIN indexes are designed for "contains" (@>) or "overlap" (&&) operators used in V2.

CREATE INDEX IF NOT EXISTS "idx_org_service_tags_gin"
ON "OrgServiceTag" USING GIN ("tagId");

CREATE INDEX IF NOT EXISTS "idx_attr_supplement_attribute_gin"
ON "AttributeSupplement" USING GIN ("attributeId");

-- 3. Extension check
-- Ensure the btree_gin extension is enabled if indexing simple types
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Note: Run EXPLAIN ANALYZE in pgAdmin to verify these are being hit by the V2 query.
