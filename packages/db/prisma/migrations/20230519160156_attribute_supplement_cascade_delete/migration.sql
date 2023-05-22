ALTER TABLE "AttributeSupplement"
	DROP CONSTRAINT "AttributeSupplement_locationAttributeAttributeId_locationA_fkey",
	DROP CONSTRAINT "AttributeSupplement_organizationAttributeAttributeId_organ_fkey",
	DROP CONSTRAINT "AttributeSupplement_serviceAccessAttributeAttributeId_serv_fkey",
	DROP CONSTRAINT "AttributeSupplement_serviceAttributeAttributeId_serviceAtt_fkey",
	DROP CONSTRAINT "AttributeSupplement_userAttributeAttributeId_userAttribute_fkey";

ALTER TABLE "AttributeSupplement"
	ADD CONSTRAINT "AttributeSupplement_locationAttributeAttributeId_locationA_fkey" FOREIGN KEY ("locationAttributeAttributeId", "locationAttributeLocationId") REFERENCES "LocationAttribute"("attributeId", "locationId") ON DELETE CASCADE ON UPDATE CASCADE,
	ADD CONSTRAINT "AttributeSupplement_organizationAttributeAttributeId_organ_fkey" FOREIGN KEY ("organizationAttributeAttributeId", "organizationAttributeOrganizationId") REFERENCES "OrganizationAttribute"("attributeId", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE,
	ADD CONSTRAINT "AttributeSupplement_serviceAccessAttributeAttributeId_serv_fkey" FOREIGN KEY ("serviceAccessAttributeAttributeId", "serviceAccessAttributeServiceAccessId") REFERENCES "ServiceAccessAttribute"("attributeId", "serviceAccessId") ON DELETE CASCADE ON UPDATE CASCADE,
	ADD CONSTRAINT "AttributeSupplement_serviceAttributeAttributeId_serviceAtt_fkey" FOREIGN KEY ("serviceAttributeAttributeId", "serviceAttributeOrgServiceId") REFERENCES "ServiceAttribute"("attributeId", "orgServiceId") ON DELETE CASCADE ON UPDATE CASCADE,
	ADD CONSTRAINT "AttributeSupplement_userAttributeAttributeId_userAttribute_fkey" FOREIGN KEY ("userAttributeAttributeId", "userAttributeUserId") REFERENCES "UserAttribute"("attributeId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

