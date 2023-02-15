-- CreateIndex
CREATE INDEX "OrgService_descriptionId_idx" ON "OrgService"("descriptionId");

-- CreateIndex
CREATE INDEX "ServiceCategory_tsKey_tsNs_idx" ON "ServiceCategory"("tsKey", "tsNs");

-- CreateIndex
CREATE INDEX "ServiceTag_tsKey_tsNs_idx" ON "ServiceTag"("tsKey", "tsNs");

-- CreateIndex
CREATE INDEX "ServiceTag_categoryId_idx" ON "ServiceTag"("categoryId");
