-- CreateIndex
CREATE INDEX "Organization_published_deleted_idx" ON "Organization"("published", "deleted");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "OrganizationAttribute_organizationId_idx" ON "OrganizationAttribute"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationAttribute_attributeId_idx" ON "OrganizationAttribute"("attributeId");
