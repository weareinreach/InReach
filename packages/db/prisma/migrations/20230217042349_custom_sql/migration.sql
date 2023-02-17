-- Add check constraint to make sure one of the required records is linked.

ALTER TABLE "AttributeSupplement"
ADD CONSTRAINT "AttributeSupplement_check_linked_records"
CHECK (
	("locationAttributeAttributeId" IS NOT NULL AND "locationAttributeLocationId" IS NOT NULL)::int
	+ ("organizationAttributeAttributeId" IS NOT NULL AND "organizationAttributeOrganizationId" IS NOT NULL)::int
	+ ("serviceAccessAttributeAttributeId" IS NOT NULL AND "serviceAccessAttributeServiceAccessId" IS NOT NULL)::int
	+ ("serviceAttributeAttributeId" IS NOT NULL AND "serviceAttributeOrgServiceId" IS NOT NULL)::int = 1
);
