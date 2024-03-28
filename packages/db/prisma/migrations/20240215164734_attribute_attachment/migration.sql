-- CreateEnum
CREATE TYPE "AttributeAttachment" AS ENUM(
	'ORGANIZATION',
	'LOCATION',
	'SERVICE',
	'USER'
);

-- AlterTable
ALTER TABLE "Attribute"
	ADD COLUMN "canAttachTo" "AttributeAttachment"[];
