/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Country` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `govDistName` on the `Country` table. All the data in the column will be lost.
  - The primary key for the `GovDist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `langId` on the `GovDist` table. All the data in the column will be lost.
  - The primary key for the `Language` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrgDescription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrgEmail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrgHours` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrgLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrgPhone` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrgReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrgService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrgSocialMedia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Organization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PhoneType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ServiceCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `langId` on the `ServiceCategory` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SocialMediaService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoryId` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `isBase` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `useDigits` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `ordinal` on the `TranslationVariable` table. All the data in the column will be lost.
  - You are about to drop the column `plural` on the `TranslationVariable` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `birthYear` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserCommunity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `langId` on the `UserCommunity` table. All the data in the column will be lost.
  - The primary key for the `UserEthnicity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `langId` on the `UserEthnicity` table. All the data in the column will be lost.
  - The primary key for the `UserImmigration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `langId` on the `UserImmigration` table. All the data in the column will be lost.
  - The primary key for the `UserRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserSOG` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `langId` on the `UserSOG` table. All the data in the column will be lost.
  - The primary key for the `UserTitle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `langId` on the `UserType` table. All the data in the column will be lost.
  - You are about to drop the `CountryTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrgNotes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrgPhotos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrgSource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TranslationCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TranslationItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CountryToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrgServiceToServiceType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrganizationToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrganizationToUserList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TranslationToTranslationVariable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserPermissionToUserRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserToUserPermission` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cca2]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[iso]` on the table `GovDist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `OrgEmail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `OrgPhone` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[langId,keyId]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ethnicity]` on the table `UserEthnicity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cca2` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translationKeyId` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `dialCode` on the `Country` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `govDistTypeId` to the `GovDist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iso` to the `GovDist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translationKeyId` to the `GovDist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translationKeyId` to the `ServiceCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keyId` to the `Translation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TranslationVariable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translationKeyId` to the `UserCommunity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translationKeyId` to the `UserEthnicity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translationKeyId` to the `UserImmigration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translationKeyId` to the `UserSOG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translationKeyId` to the `UserType` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserSavedListVisibility" AS ENUM ('PRIVATE', 'SHARED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('ORGANIZATION', 'USER');

-- CreateEnum
CREATE TYPE "VariableType" AS ENUM ('CARDINAL', 'ORDINAL', 'VALUE');

-- CreateEnum
CREATE TYPE "VisibilitySetting" AS ENUM ('NONE', 'LOGGED_IN', 'PROVIDER', 'PUBLIC');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Country" DROP CONSTRAINT "Country_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Country" DROP CONSTRAINT "Country_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "CountryTranslation" DROP CONSTRAINT "CountryTranslation_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CountryTranslation" DROP CONSTRAINT "CountryTranslation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "CountryTranslation" DROP CONSTRAINT "CountryTranslation_langId_fkey";

-- DropForeignKey
ALTER TABLE "CountryTranslation" DROP CONSTRAINT "CountryTranslation_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "GovDist" DROP CONSTRAINT "GovDist_countryId_fkey";

-- DropForeignKey
ALTER TABLE "GovDist" DROP CONSTRAINT "GovDist_createdById_fkey";

-- DropForeignKey
ALTER TABLE "GovDist" DROP CONSTRAINT "GovDist_langId_fkey";

-- DropForeignKey
ALTER TABLE "GovDist" DROP CONSTRAINT "GovDist_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Language" DROP CONSTRAINT "Language_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Language" DROP CONSTRAINT "Language_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgDescription" DROP CONSTRAINT "OrgDescription_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgDescription" DROP CONSTRAINT "OrgDescription_langId_fkey";

-- DropForeignKey
ALTER TABLE "OrgDescription" DROP CONSTRAINT "OrgDescription_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrgDescription" DROP CONSTRAINT "OrgDescription_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgEmail" DROP CONSTRAINT "OrgEmail_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgEmail" DROP CONSTRAINT "OrgEmail_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrgEmail" DROP CONSTRAINT "OrgEmail_titleId_fkey";

-- DropForeignKey
ALTER TABLE "OrgEmail" DROP CONSTRAINT "OrgEmail_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgHours" DROP CONSTRAINT "OrgHours_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgHours" DROP CONSTRAINT "OrgHours_orgLocId_fkey";

-- DropForeignKey
ALTER TABLE "OrgHours" DROP CONSTRAINT "OrgHours_orgServiceId_fkey";

-- DropForeignKey
ALTER TABLE "OrgHours" DROP CONSTRAINT "OrgHours_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgLocation" DROP CONSTRAINT "OrgLocation_countryId_fkey";

-- DropForeignKey
ALTER TABLE "OrgLocation" DROP CONSTRAINT "OrgLocation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgLocation" DROP CONSTRAINT "OrgLocation_govDistId_fkey";

-- DropForeignKey
ALTER TABLE "OrgLocation" DROP CONSTRAINT "OrgLocation_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrgLocation" DROP CONSTRAINT "OrgLocation_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgNotes" DROP CONSTRAINT "OrgNotes_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgNotes" DROP CONSTRAINT "OrgNotes_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrgNotes" DROP CONSTRAINT "OrgNotes_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgPhone" DROP CONSTRAINT "OrgPhone_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgPhone" DROP CONSTRAINT "OrgPhone_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgPhone" DROP CONSTRAINT "OrgPhone_phoneTypeId_fkey";

-- DropForeignKey
ALTER TABLE "OrgPhone" DROP CONSTRAINT "OrgPhone_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgPhotos" DROP CONSTRAINT "OrgPhotos_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgPhotos" DROP CONSTRAINT "OrgPhotos_orgId_fkey";

-- DropForeignKey
ALTER TABLE "OrgPhotos" DROP CONSTRAINT "OrgPhotos_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgReview" DROP CONSTRAINT "OrgReview_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgReview" DROP CONSTRAINT "OrgReview_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgReview" DROP CONSTRAINT "OrgReview_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "OrgReview" DROP CONSTRAINT "OrgReview_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgService" DROP CONSTRAINT "OrgService_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgService" DROP CONSTRAINT "OrgService_langId_fkey";

-- DropForeignKey
ALTER TABLE "OrgService" DROP CONSTRAINT "OrgService_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgService" DROP CONSTRAINT "OrgService_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgSocialMedia" DROP CONSTRAINT "OrgSocialMedia_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgSocialMedia" DROP CONSTRAINT "OrgSocialMedia_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgSocialMedia" DROP CONSTRAINT "OrgSocialMedia_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "OrgSocialMedia" DROP CONSTRAINT "OrgSocialMedia_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "OrgSource" DROP CONSTRAINT "OrgSource_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrgSource" DROP CONSTRAINT "OrgSource_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "PhoneType" DROP CONSTRAINT "PhoneType_createdById_fkey";

-- DropForeignKey
ALTER TABLE "PhoneType" DROP CONSTRAINT "PhoneType_langId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneType" DROP CONSTRAINT "PhoneType_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "ServiceCategory" DROP CONSTRAINT "ServiceCategory_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ServiceCategory" DROP CONSTRAINT "ServiceCategory_langId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceCategory" DROP CONSTRAINT "ServiceCategory_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "ServiceType" DROP CONSTRAINT "ServiceType_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceType" DROP CONSTRAINT "ServiceType_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ServiceType" DROP CONSTRAINT "ServiceType_langId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceType" DROP CONSTRAINT "ServiceType_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "SocialMediaService" DROP CONSTRAINT "SocialMediaService_createdById_fkey";

-- DropForeignKey
ALTER TABLE "SocialMediaService" DROP CONSTRAINT "SocialMediaService_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_langId_fkey";

-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "TranslationCategory" DROP CONSTRAINT "TranslationCategory_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TranslationCategory" DROP CONSTRAINT "TranslationCategory_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "TranslationItem" DROP CONSTRAINT "TranslationItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "TranslationItem" DROP CONSTRAINT "TranslationItem_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TranslationItem" DROP CONSTRAINT "TranslationItem_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "TranslationVariable" DROP CONSTRAINT "TranslationVariable_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TranslationVariable" DROP CONSTRAINT "TranslationVariable_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_immigrationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_langPrefId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orgTitleId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userTypeId_fkey";

-- DropForeignKey
ALTER TABLE "UserCommunity" DROP CONSTRAINT "UserCommunity_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserCommunity" DROP CONSTRAINT "UserCommunity_langId_fkey";

-- DropForeignKey
ALTER TABLE "UserCommunity" DROP CONSTRAINT "UserCommunity_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "UserEthnicity" DROP CONSTRAINT "UserEthnicity_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserEthnicity" DROP CONSTRAINT "UserEthnicity_langId_fkey";

-- DropForeignKey
ALTER TABLE "UserEthnicity" DROP CONSTRAINT "UserEthnicity_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "UserImmigration" DROP CONSTRAINT "UserImmigration_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserImmigration" DROP CONSTRAINT "UserImmigration_langId_fkey";

-- DropForeignKey
ALTER TABLE "UserImmigration" DROP CONSTRAINT "UserImmigration_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "UserList" DROP CONSTRAINT "UserList_ownedById_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "UserSOG" DROP CONSTRAINT "UserSOG_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserSOG" DROP CONSTRAINT "UserSOG_langId_fkey";

-- DropForeignKey
ALTER TABLE "UserSOG" DROP CONSTRAINT "UserSOG_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "UserTitle" DROP CONSTRAINT "UserTitle_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserTitle" DROP CONSTRAINT "UserTitle_langId_fkey";

-- DropForeignKey
ALTER TABLE "UserTitle" DROP CONSTRAINT "UserTitle_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "UserType" DROP CONSTRAINT "UserType_createdById_fkey";

-- DropForeignKey
ALTER TABLE "UserType" DROP CONSTRAINT "UserType_langId_fkey";

-- DropForeignKey
ALTER TABLE "UserType" DROP CONSTRAINT "UserType_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToUser" DROP CONSTRAINT "_CountryToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToUser" DROP CONSTRAINT "_CountryToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_OrgServiceToServiceType" DROP CONSTRAINT "_OrgServiceToServiceType_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrgServiceToServiceType" DROP CONSTRAINT "_OrgServiceToServiceType_B_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToUserList" DROP CONSTRAINT "_OrganizationToUserList_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationToUserList" DROP CONSTRAINT "_OrganizationToUserList_B_fkey";

-- DropForeignKey
ALTER TABLE "_TranslationToTranslationVariable" DROP CONSTRAINT "_TranslationToTranslationVariable_A_fkey";

-- DropForeignKey
ALTER TABLE "_TranslationToTranslationVariable" DROP CONSTRAINT "_TranslationToTranslationVariable_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserPermissionToUserRole" DROP CONSTRAINT "_UserPermissionToUserRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserPermissionToUserRole" DROP CONSTRAINT "_UserPermissionToUserRole_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserCommunity" DROP CONSTRAINT "_UserToUserCommunity_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserCommunity" DROP CONSTRAINT "_UserToUserCommunity_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserEthnicity" DROP CONSTRAINT "_UserToUserEthnicity_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserEthnicity" DROP CONSTRAINT "_UserToUserEthnicity_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserPermission" DROP CONSTRAINT "_UserToUserPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserPermission" DROP CONSTRAINT "_UserToUserPermission_B_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserSOG" DROP CONSTRAINT "_UserToUserSOG_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserToUserSOG" DROP CONSTRAINT "_UserToUserSOG_B_fkey";

-- DropForeignKey
ALTER TABLE "_sharedLists" DROP CONSTRAINT "_sharedLists_A_fkey";

-- DropForeignKey
ALTER TABLE "_sharedLists" DROP CONSTRAINT "_sharedLists_B_fkey";

-- DropIndex
DROP INDEX "GovDist_countryId_langId_idx";

-- DropIndex
DROP INDEX "UserEthnicity_langId_ethnicity_key";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "type" SET DATA TYPE TEXT,
ALTER COLUMN "provider" SET DATA TYPE TEXT,
ALTER COLUMN "providerAccountId" SET DATA TYPE TEXT,
ALTER COLUMN "refresh_token" SET DATA TYPE TEXT,
ALTER COLUMN "access_token" SET DATA TYPE TEXT,
ALTER COLUMN "token_type" SET DATA TYPE TEXT,
ALTER COLUMN "scope" SET DATA TYPE TEXT,
ALTER COLUMN "id_token" SET DATA TYPE TEXT,
ALTER COLUMN "session_state" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Country" DROP CONSTRAINT "Country_pkey",
DROP COLUMN "govDistName",
ADD COLUMN     "cca2" CHAR(2) NOT NULL,
ADD COLUMN     "geoJSON" JSONB,
ADD COLUMN     "translationKeyId" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
DROP COLUMN "dialCode",
ADD COLUMN     "dialCode" SMALLINT NOT NULL,
ALTER COLUMN "flag" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "Country_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GovDist" DROP CONSTRAINT "GovDist_pkey",
DROP COLUMN "langId",
ADD COLUMN     "geoJSON" JSONB,
ADD COLUMN     "govDistTypeId" TEXT NOT NULL,
ADD COLUMN     "iso" TEXT NOT NULL,
ADD COLUMN     "translationKeyId" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "countryId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "GovDist_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Language" DROP CONSTRAINT "Language_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "languageName" SET DATA TYPE TEXT,
ALTER COLUMN "localeCode" SET DATA TYPE TEXT,
ALTER COLUMN "nativeName" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "Language_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgDescription" DROP CONSTRAINT "OrgDescription_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "langId" SET DATA TYPE TEXT,
ALTER COLUMN "orgId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrgDescription_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgEmail" DROP CONSTRAINT "OrgEmail_pkey",
ADD COLUMN     "orgLocationOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "firstName" SET DATA TYPE TEXT,
ALTER COLUMN "lastName" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "titleId" SET DATA TYPE TEXT,
ALTER COLUMN "orgId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrgEmail_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgHours" DROP CONSTRAINT "OrgHours_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "end" SET DEFAULT 1439,
ALTER COLUMN "orgLocId" SET DATA TYPE TEXT,
ALTER COLUMN "orgServiceId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrgHours_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgLocation" DROP CONSTRAINT "OrgLocation_pkey",
ADD COLUMN     "apiLocationId" TEXT,
ADD COLUMN     "outsideApiId" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "street1" SET DATA TYPE TEXT,
ALTER COLUMN "street2" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "govDistId" SET DATA TYPE TEXT,
ALTER COLUMN "postCode" SET DATA TYPE TEXT,
ALTER COLUMN "countryId" SET DATA TYPE TEXT,
ALTER COLUMN "orgId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrgLocation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgPhone" DROP CONSTRAINT "OrgPhone_pkey",
ADD COLUMN     "orgLocationOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "number" SET DATA TYPE TEXT,
ALTER COLUMN "phoneTypeId" SET DATA TYPE TEXT,
ALTER COLUMN "organizationId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrgPhone_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgReview" DROP CONSTRAINT "OrgReview_pkey",
ADD COLUMN     "langId" TEXT,
ADD COLUMN     "lcrCity" TEXT,
ADD COLUMN     "lcrCountryId" TEXT,
ADD COLUMN     "lcrGovDistId" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organizationId" SET DATA TYPE TEXT,
ALTER COLUMN "serviceId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrgReview_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgService" DROP CONSTRAINT "OrgService_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "published" SET DEFAULT false,
ALTER COLUMN "accessInstructions" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "organizationId" SET DATA TYPE TEXT,
ALTER COLUMN "langId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrgService_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgSocialMedia" DROP CONSTRAINT "OrgSocialMedia_pkey",
ADD COLUMN     "orgLocationOnly" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "username" SET DATA TYPE TEXT,
ALTER COLUMN "url" SET DATA TYPE TEXT,
ALTER COLUMN "serviceId" SET DATA TYPE TEXT,
ALTER COLUMN "organizationId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrgSocialMedia_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_pkey",
ADD COLUMN     "apiIdentifier" TEXT,
ADD COLUMN     "legacyId" TEXT,
ADD COLUMN     "outsideApiId" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "sourceId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "Organization_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PhoneType" DROP CONSTRAINT "PhoneType_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "type" SET DATA TYPE TEXT,
ALTER COLUMN "langId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "PhoneType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ServiceCategory" DROP CONSTRAINT "ServiceCategory_pkey",
DROP COLUMN "langId",
ADD COLUMN     "translationKeyId" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sessionToken" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SocialMediaService" DROP CONSTRAINT "SocialMediaService_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "urlBase" SET DATA TYPE TEXT,
ALTER COLUMN "logoIcon" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "SocialMediaService_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Translation" DROP COLUMN "categoryId",
DROP COLUMN "isBase",
DROP COLUMN "itemId",
DROP COLUMN "parentId",
DROP COLUMN "useDigits",
ADD COLUMN     "keyId" TEXT NOT NULL,
ALTER COLUMN "langId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TranslationVariable" DROP COLUMN "ordinal",
DROP COLUMN "plural",
ADD COLUMN     "type" "VariableType" NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "associatedOrgId" TEXT,
ADD COLUMN     "currentCity" TEXT,
ADD COLUMN     "currentCountryId" TEXT,
ADD COLUMN     "currentGovDistId" TEXT,
ADD COLUMN     "legacyId" TEXT,
ADD COLUMN     "sourceId" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "image" SET DATA TYPE TEXT,
DROP COLUMN "birthYear",
ADD COLUMN     "birthYear" SMALLINT,
ALTER COLUMN "reasonForJoin" SET DATA TYPE TEXT,
ALTER COLUMN "orgTitleId" SET DATA TYPE TEXT,
ALTER COLUMN "immigrationId" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ALTER COLUMN "userTypeId" SET DATA TYPE TEXT,
ALTER COLUMN "langPrefId" SET DATA TYPE TEXT,
ALTER COLUMN "legacyHash" SET DATA TYPE TEXT,
ALTER COLUMN "legacySalt" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserCommunity" DROP CONSTRAINT "UserCommunity_pkey",
DROP COLUMN "langId",
ADD COLUMN     "translationKeyId" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "community" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserCommunity_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserEthnicity" DROP CONSTRAINT "UserEthnicity_pkey",
DROP COLUMN "langId",
ADD COLUMN     "translationKeyId" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "ethnicity" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserEthnicity_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserImmigration" DROP CONSTRAINT "UserImmigration_pkey",
DROP COLUMN "langId",
ADD COLUMN     "translationKeyId" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserImmigration_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserSOG" DROP CONSTRAINT "UserSOG_pkey",
DROP COLUMN "langId",
ADD COLUMN     "translationKeyId" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sog" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserSOG_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserTitle" DROP CONSTRAINT "UserTitle_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "text" SET DATA TYPE TEXT,
ALTER COLUMN "langId" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserTitle_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserType" DROP CONSTRAINT "UserType_pkey",
DROP COLUMN "langId",
ADD COLUMN     "translationKeyId" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "type" SET DATA TYPE TEXT,
ALTER COLUMN "createdById" SET DATA TYPE TEXT,
ALTER COLUMN "updatedById" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "VerificationToken" ALTER COLUMN "identifier" SET DATA TYPE TEXT,
ALTER COLUMN "token" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_UserToUserCommunity" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_UserToUserEthnicity" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_UserToUserSOG" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_sharedLists" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "CountryTranslation";

-- DropTable
DROP TABLE "OrgNotes";

-- DropTable
DROP TABLE "OrgPhotos";

-- DropTable
DROP TABLE "OrgSource";

-- DropTable
DROP TABLE "ServiceType";

-- DropTable
DROP TABLE "TranslationCategory";

-- DropTable
DROP TABLE "TranslationItem";

-- DropTable
DROP TABLE "UserList";

-- DropTable
DROP TABLE "UserPermission";

-- DropTable
DROP TABLE "_CountryToUser";

-- DropTable
DROP TABLE "_OrgServiceToServiceType";

-- DropTable
DROP TABLE "_OrganizationToUser";

-- DropTable
DROP TABLE "_OrganizationToUserList";

-- DropTable
DROP TABLE "_TranslationToTranslationVariable";

-- DropTable
DROP TABLE "_UserPermissionToUserRole";

-- DropTable
DROP TABLE "_UserToUserPermission";

-- DropEnum
DROP TYPE "UserListVisibility";

-- CreateTable
CREATE TABLE "PermissionAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "PermissionAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "PermissionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSavedList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visibility" "UserSavedListVisibility" NOT NULL DEFAULT 'PRIVATE',
    "ownedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSavedList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgPhoto" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "height" SMALLINT,
    "width" SMALLINT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "orgId" TEXT,
    "orgLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "OrgPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTag" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "translationKeyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "ServiceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovDistType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "translationKeyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "GovDistType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationNamespace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "TranslationNamespace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "namespaceId" TEXT NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "TranslationKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutsideAPI" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "urlPattern" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "OutsideAPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldVisibility" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "email" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "image" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "ethnicity" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "countryOrigin" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "SOG" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "communities" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "currentCity" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "currentGovDist" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "currentCountry" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "userType" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "associatedOrg" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "orgTitle" "VisibilitySetting" NOT NULL DEFAULT 'NONE',
    "createdAt" "VisibilitySetting" NOT NULL DEFAULT 'NONE',

    CONSTRAINT "FieldVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalNote" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "orgId" TEXT,
    "orgDescriptionId" TEXT,
    "orgEmailId" TEXT,
    "orgPhoneId" TEXT,
    "orgSocialMediaId" TEXT,
    "orgLocationId" TEXT,
    "orgPhotoId" TEXT,
    "orgHoursId" TEXT,
    "orgServiceId" TEXT,
    "orgReviewId" TEXT,
    "serviceCategoryId" TEXT,
    "serviceTagId" TEXT,
    "countryId" TEXT,
    "govDistId" TEXT,
    "languageId" TEXT,
    "translationNamespaceId" TEXT,
    "translationKeyId" TEXT,
    "translationId" TEXT,
    "translationVariableId" TEXT,
    "outsideApiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT NOT NULL,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionItemToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionItemToUserRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrganizationToUserSavedList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrganizationToPermissionAsset" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrgEmailToOrgLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrgLocationToPermissionAsset" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrgLocationToOrgPhone" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrgLocationToOrgSocialMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrgServiceToServiceTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_countryOrigin" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TranslationKeyToTranslationVariable" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationNamespace_name_key" ON "TranslationNamespace"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationKey_key_namespaceId_key" ON "TranslationKey"("key", "namespaceId");

-- CreateIndex
CREATE UNIQUE INDEX "OutsideAPI_name_key" ON "OutsideAPI"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionItemToUser_AB_unique" ON "_PermissionItemToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionItemToUser_B_index" ON "_PermissionItemToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionItemToUserRole_AB_unique" ON "_PermissionItemToUserRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionItemToUserRole_B_index" ON "_PermissionItemToUserRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToUserSavedList_AB_unique" ON "_OrganizationToUserSavedList"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToUserSavedList_B_index" ON "_OrganizationToUserSavedList"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToPermissionAsset_AB_unique" ON "_OrganizationToPermissionAsset"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToPermissionAsset_B_index" ON "_OrganizationToPermissionAsset"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrgEmailToOrgLocation_AB_unique" ON "_OrgEmailToOrgLocation"("A", "B");

-- CreateIndex
CREATE INDEX "_OrgEmailToOrgLocation_B_index" ON "_OrgEmailToOrgLocation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrgLocationToPermissionAsset_AB_unique" ON "_OrgLocationToPermissionAsset"("A", "B");

-- CreateIndex
CREATE INDEX "_OrgLocationToPermissionAsset_B_index" ON "_OrgLocationToPermissionAsset"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrgLocationToOrgPhone_AB_unique" ON "_OrgLocationToOrgPhone"("A", "B");

-- CreateIndex
CREATE INDEX "_OrgLocationToOrgPhone_B_index" ON "_OrgLocationToOrgPhone"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrgLocationToOrgSocialMedia_AB_unique" ON "_OrgLocationToOrgSocialMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_OrgLocationToOrgSocialMedia_B_index" ON "_OrgLocationToOrgSocialMedia"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrgServiceToServiceTag_AB_unique" ON "_OrgServiceToServiceTag"("A", "B");

-- CreateIndex
CREATE INDEX "_OrgServiceToServiceTag_B_index" ON "_OrgServiceToServiceTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_countryOrigin_AB_unique" ON "_countryOrigin"("A", "B");

-- CreateIndex
CREATE INDEX "_countryOrigin_B_index" ON "_countryOrigin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TranslationKeyToTranslationVariable_AB_unique" ON "_TranslationKeyToTranslationVariable"("A", "B");

-- CreateIndex
CREATE INDEX "_TranslationKeyToTranslationVariable_B_index" ON "_TranslationKeyToTranslationVariable"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Country_cca2_key" ON "Country"("cca2");

-- CreateIndex
CREATE UNIQUE INDEX "GovDist_iso_key" ON "GovDist"("iso");

-- CreateIndex
CREATE UNIQUE INDEX "OrgEmail_userId_key" ON "OrgEmail"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgPhone_userId_key" ON "OrgPhone"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_langId_keyId_key" ON "Translation"("langId", "keyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEthnicity_ethnicity_key" ON "UserEthnicity"("ethnicity");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentGovDistId_fkey" FOREIGN KEY ("currentGovDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentCountryId_fkey" FOREIGN KEY ("currentCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_immigrationId_fkey" FOREIGN KEY ("immigrationId") REFERENCES "UserImmigration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_langPrefId_fkey" FOREIGN KEY ("langPrefId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_associatedOrgId_fkey" FOREIGN KEY ("associatedOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgTitleId_fkey" FOREIGN KEY ("orgTitleId") REFERENCES "UserTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionAsset" ADD CONSTRAINT "PermissionAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionAsset" ADD CONSTRAINT "PermissionAsset_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "PermissionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionItem" ADD CONSTRAINT "PermissionItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermissionItem" ADD CONSTRAINT "PermissionItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserType" ADD CONSTRAINT "UserType_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserType" ADD CONSTRAINT "UserType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserType" ADD CONSTRAINT "UserType_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTitle" ADD CONSTRAINT "UserTitle_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTitle" ADD CONSTRAINT "UserTitle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTitle" ADD CONSTRAINT "UserTitle_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEthnicity" ADD CONSTRAINT "UserEthnicity_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEthnicity" ADD CONSTRAINT "UserEthnicity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEthnicity" ADD CONSTRAINT "UserEthnicity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImmigration" ADD CONSTRAINT "UserImmigration_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImmigration" ADD CONSTRAINT "UserImmigration_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImmigration" ADD CONSTRAINT "UserImmigration_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSOG" ADD CONSTRAINT "UserSOG_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSOG" ADD CONSTRAINT "UserSOG_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSOG" ADD CONSTRAINT "UserSOG_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCommunity" ADD CONSTRAINT "UserCommunity_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCommunity" ADD CONSTRAINT "UserCommunity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCommunity" ADD CONSTRAINT "UserCommunity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSavedList" ADD CONSTRAINT "UserSavedList_ownedById_fkey" FOREIGN KEY ("ownedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgDescription" ADD CONSTRAINT "OrgDescription_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgDescription" ADD CONSTRAINT "OrgDescription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgDescription" ADD CONSTRAINT "OrgDescription_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgDescription" ADD CONSTRAINT "OrgDescription_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "UserTitle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "PhoneType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "SocialMediaService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhoto" ADD CONSTRAINT "OrgPhoto_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhoto" ADD CONSTRAINT "OrgPhoto_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhoto" ADD CONSTRAINT "OrgPhoto_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhoto" ADD CONSTRAINT "OrgPhoto_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgHours" ADD CONSTRAINT "OrgHours_orgLocId_fkey" FOREIGN KEY ("orgLocId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgHours" ADD CONSTRAINT "OrgHours_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgHours" ADD CONSTRAINT "OrgHours_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgHours" ADD CONSTRAINT "OrgHours_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgService" ADD CONSTRAINT "OrgService_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_lcrGovDistId_fkey" FOREIGN KEY ("lcrGovDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_lcrCountryId_fkey" FOREIGN KEY ("lcrCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTag" ADD CONSTRAINT "ServiceTag_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTag" ADD CONSTRAINT "ServiceTag_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTag" ADD CONSTRAINT "ServiceTag_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTag" ADD CONSTRAINT "ServiceTag_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneType" ADD CONSTRAINT "PhoneType_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneType" ADD CONSTRAINT "PhoneType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneType" ADD CONSTRAINT "PhoneType_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaService" ADD CONSTRAINT "SocialMediaService_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaService" ADD CONSTRAINT "SocialMediaService_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_govDistTypeId_fkey" FOREIGN KEY ("govDistTypeId") REFERENCES "GovDistType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDistType" ADD CONSTRAINT "GovDistType_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDistType" ADD CONSTRAINT "GovDistType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDistType" ADD CONSTRAINT "GovDistType_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationNamespace" ADD CONSTRAINT "TranslationNamespace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationNamespace" ADD CONSTRAINT "TranslationNamespace_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationKey" ADD CONSTRAINT "TranslationKey_namespaceId_fkey" FOREIGN KEY ("namespaceId") REFERENCES "TranslationNamespace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationKey" ADD CONSTRAINT "TranslationKey_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationKey" ADD CONSTRAINT "TranslationKey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationKey" ADD CONSTRAINT "TranslationKey_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "TranslationKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationVariable" ADD CONSTRAINT "TranslationVariable_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationVariable" ADD CONSTRAINT "TranslationVariable_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutsideAPI" ADD CONSTRAINT "OutsideAPI_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutsideAPI" ADD CONSTRAINT "OutsideAPI_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldVisibility" ADD CONSTRAINT "FieldVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgDescriptionId_fkey" FOREIGN KEY ("orgDescriptionId") REFERENCES "OrgDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgEmailId_fkey" FOREIGN KEY ("orgEmailId") REFERENCES "OrgEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgPhoneId_fkey" FOREIGN KEY ("orgPhoneId") REFERENCES "OrgPhone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgSocialMediaId_fkey" FOREIGN KEY ("orgSocialMediaId") REFERENCES "OrgSocialMedia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgLocationId_fkey" FOREIGN KEY ("orgLocationId") REFERENCES "OrgLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgPhotoId_fkey" FOREIGN KEY ("orgPhotoId") REFERENCES "OrgPhoto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgHoursId_fkey" FOREIGN KEY ("orgHoursId") REFERENCES "OrgHours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgServiceId_fkey" FOREIGN KEY ("orgServiceId") REFERENCES "OrgService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_orgReviewId_fkey" FOREIGN KEY ("orgReviewId") REFERENCES "OrgReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_serviceTagId_fkey" FOREIGN KEY ("serviceTagId") REFERENCES "ServiceTag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_translationNamespaceId_fkey" FOREIGN KEY ("translationNamespaceId") REFERENCES "TranslationNamespace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "TranslationKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_translationVariableId_fkey" FOREIGN KEY ("translationVariableId") REFERENCES "TranslationVariable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_outsideApiId_fkey" FOREIGN KEY ("outsideApiId") REFERENCES "OutsideAPI"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalNote" ADD CONSTRAINT "InternalNote_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserEthnicity" ADD CONSTRAINT "_UserToUserEthnicity_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserEthnicity" ADD CONSTRAINT "_UserToUserEthnicity_B_fkey" FOREIGN KEY ("B") REFERENCES "UserEthnicity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserSOG" ADD CONSTRAINT "_UserToUserSOG_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserSOG" ADD CONSTRAINT "_UserToUserSOG_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSOG"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserCommunity" ADD CONSTRAINT "_UserToUserCommunity_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserCommunity" ADD CONSTRAINT "_UserToUserCommunity_B_fkey" FOREIGN KEY ("B") REFERENCES "UserCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedLists" ADD CONSTRAINT "_sharedLists_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedLists" ADD CONSTRAINT "_sharedLists_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionItemToUser" ADD CONSTRAINT "_PermissionItemToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "PermissionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionItemToUser" ADD CONSTRAINT "_PermissionItemToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionItemToUserRole" ADD CONSTRAINT "_PermissionItemToUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES "PermissionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionItemToUserRole" ADD CONSTRAINT "_PermissionItemToUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUserSavedList" ADD CONSTRAINT "_OrganizationToUserSavedList_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUserSavedList" ADD CONSTRAINT "_OrganizationToUserSavedList_B_fkey" FOREIGN KEY ("B") REFERENCES "UserSavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToPermissionAsset" ADD CONSTRAINT "_OrganizationToPermissionAsset_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToPermissionAsset" ADD CONSTRAINT "_OrganizationToPermissionAsset_B_fkey" FOREIGN KEY ("B") REFERENCES "PermissionAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgEmailToOrgLocation" ADD CONSTRAINT "_OrgEmailToOrgLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "OrgEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgEmailToOrgLocation" ADD CONSTRAINT "_OrgEmailToOrgLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgLocationToPermissionAsset" ADD CONSTRAINT "_OrgLocationToPermissionAsset_A_fkey" FOREIGN KEY ("A") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgLocationToPermissionAsset" ADD CONSTRAINT "_OrgLocationToPermissionAsset_B_fkey" FOREIGN KEY ("B") REFERENCES "PermissionAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgLocationToOrgPhone" ADD CONSTRAINT "_OrgLocationToOrgPhone_A_fkey" FOREIGN KEY ("A") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgLocationToOrgPhone" ADD CONSTRAINT "_OrgLocationToOrgPhone_B_fkey" FOREIGN KEY ("B") REFERENCES "OrgPhone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgLocationToOrgSocialMedia" ADD CONSTRAINT "_OrgLocationToOrgSocialMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "OrgLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgLocationToOrgSocialMedia" ADD CONSTRAINT "_OrgLocationToOrgSocialMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "OrgSocialMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgServiceToServiceTag" ADD CONSTRAINT "_OrgServiceToServiceTag_A_fkey" FOREIGN KEY ("A") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgServiceToServiceTag" ADD CONSTRAINT "_OrgServiceToServiceTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_countryOrigin" ADD CONSTRAINT "_countryOrigin_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_countryOrigin" ADD CONSTRAINT "_countryOrigin_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TranslationKeyToTranslationVariable" ADD CONSTRAINT "_TranslationKeyToTranslationVariable_A_fkey" FOREIGN KEY ("A") REFERENCES "TranslationKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TranslationKeyToTranslationVariable" ADD CONSTRAINT "_TranslationKeyToTranslationVariable_B_fkey" FOREIGN KEY ("B") REFERENCES "TranslationVariable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
