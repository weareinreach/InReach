/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `type` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `provider` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `providerAccountId` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `refresh_token` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `access_token` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `token_type` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `scope` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(256)`.
  - You are about to alter the column `id_token` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `session_state` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `userId` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `Country` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `cca3` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(3)`.
  - You are about to alter the column `name` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `govDistName` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `dialCode` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `flag` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `createdById` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `Country` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `CountryTranslation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `CountryTranslation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `CountryTranslation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `govDistName` on the `CountryTranslation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `countryId` on the `CountryTranslation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langId` on the `CountryTranslation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `CountryTranslation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `CountryTranslation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `GovDist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `GovDist` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `GovDist` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `countryId` on the `GovDist` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langId` on the `GovDist` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `GovDist` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `GovDist` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `Language` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Language` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `languageName` on the `Language` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `localeCode` on the `Language` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.
  - You are about to alter the column `iso6392` on the `Language` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(3)`.
  - You are about to alter the column `nativeName` on the `Language` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `Language` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `Language` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgDescription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgDescription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langId` on the `OrgDescription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `orgId` on the `OrgDescription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgDescription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgDescription` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgEmail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgEmail` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `firstName` on the `OrgEmail` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `lastName` on the `OrgEmail` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `email` on the `OrgEmail` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `titleId` on the `OrgEmail` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `orgId` on the `OrgEmail` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgEmail` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgEmail` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgHours` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgHours` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `dayIndex` on the `OrgHours` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `start` on the `OrgHours` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `end` on the `OrgHours` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `orgLocId` on the `OrgHours` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `orgServiceId` on the `OrgHours` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgHours` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgHours` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `street1` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `street2` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `city` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `govDistId` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `postCode` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `countryId` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `orgId` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgLocation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgNotes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgNotes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `orgId` on the `OrgNotes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgNotes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgNotes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgPhone` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgPhone` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `number` on the `OrgPhone` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `phoneTypeId` on the `OrgPhone` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `organizationId` on the `OrgPhone` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgPhone` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgPhone` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgPhotos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgPhotos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `foursquareId` on the `OrgPhotos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `src` on the `OrgPhotos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `height` on the `OrgPhotos` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `width` on the `OrgPhotos` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `orgId` on the `OrgPhotos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgPhotos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgPhotos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `rating` on the `OrgReview` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - You are about to alter the column `organizationId` on the `OrgReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `serviceId` on the `OrgReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgReview` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `organizationId` on the `OrgService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langId` on the `OrgService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgSocialMedia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgSocialMedia` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `username` on the `OrgSocialMedia` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `url` on the `OrgSocialMedia` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `serviceId` on the `OrgSocialMedia` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `organizationId` on the `OrgSocialMedia` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `OrgSocialMedia` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgSocialMedia` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `OrgSource` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `OrgSource` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `source` on the `OrgSource` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `createdById` on the `OrgSource` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `OrgSource` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `Organization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Organization` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `Organization` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `sourceId` on the `Organization` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `Organization` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `Organization` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `PhoneType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `PhoneType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `type` on the `PhoneType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langId` on the `PhoneType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `PhoneType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `PhoneType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `ServiceCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ServiceCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `category` on the `ServiceCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langId` on the `ServiceCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `ServiceCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `ServiceCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `ServiceType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ServiceType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `type` on the `ServiceType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langId` on the `ServiceType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `categoryId` on the `ServiceType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `ServiceType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `ServiceType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `sessionToken` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `userId` on the `Session` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `SocialMediaService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `SocialMediaService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `SocialMediaService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `urlBase` on the `SocialMediaService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `logoIcon` on the `SocialMediaService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `SocialMediaService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `SocialMediaService` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langId` on the `Translation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `categoryId` on the `Translation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `itemId` on the `Translation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `parentId` on the `Translation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `Translation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `Translation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `category` on the `TranslationCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(16)`.
  - You are about to alter the column `createdById` on the `TranslationCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `TranslationCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `tagName` on the `TranslationItem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `categoryId` on the `TranslationItem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `TranslationItem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `TranslationItem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `TranslationVariable` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `description` on the `TranslationVariable` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `createdById` on the `TranslationVariable` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `TranslationVariable` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `image` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(256)`.
  - You are about to alter the column `birthYear` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(4)`.
  - You are about to alter the column `reasonForJoin` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `orgTitleId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `immigrationId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `roleId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `userTypeId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langPrefId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `UserCommunity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserCommunity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `community` on the `UserCommunity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `langId` on the `UserCommunity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `UserCommunity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `UserCommunity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `UserEthnicity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserEthnicity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `ethnicity` on the `UserEthnicity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `langId` on the `UserEthnicity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `UserEthnicity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `UserEthnicity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `UserImmigration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserImmigration` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `status` on the `UserImmigration` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `langId` on the `UserImmigration` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `UserImmigration` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `UserImmigration` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `UserList` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserList` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `UserList` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `ownedById` on the `UserList` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `UserPermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserPermission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `UserPermission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `UserPermission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `UserPermission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `UserRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserRole` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `name` on the `UserRole` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `createdById` on the `UserRole` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `UserRole` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `UserSOG` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserSOG` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `sog` on the `UserSOG` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `langId` on the `UserSOG` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `UserSOG` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `UserSOG` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `UserTitle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserTitle` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `text` on the `UserTitle` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `langId` on the `UserTitle` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `UserTitle` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `UserTitle` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `UserType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `UserType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `type` on the `UserType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `langId` on the `UserType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `createdById` on the `UserType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `updatedById` on the `UserType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `identifier` on the `VerificationToken` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `token` on the `VerificationToken` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - You are about to alter the column `A` on the `_CountryToUser` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_CountryToUser` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `A` on the `_OrgServiceToServiceType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_OrgServiceToServiceType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `A` on the `_OrganizationToUser` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_OrganizationToUser` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `A` on the `_OrganizationToUserList` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_OrganizationToUserList` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `A` on the `_UserPermissionToUserRole` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_UserPermissionToUserRole` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `A` on the `_UserToUserCommunity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_UserToUserCommunity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `A` on the `_UserToUserEthnicity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_UserToUserEthnicity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `A` on the `_UserToUserPermission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_UserToUserPermission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `A` on the `_UserToUserSOG` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_UserToUserSOG` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `A` on the `_sharedLists` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `B` on the `_sharedLists` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.

*/
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

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "type" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "provider" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "providerAccountId" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "refresh_token" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "access_token" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "token_type" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "scope" SET DATA TYPE VARCHAR(256),
ALTER COLUMN "id_token" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "session_state" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Country" DROP CONSTRAINT "Country_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "cca3" SET DATA TYPE CHAR(3),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "govDistName" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "dialCode" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "flag" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "Country_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "CountryTranslation" DROP CONSTRAINT "CountryTranslation_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "govDistName" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "countryId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "CountryTranslation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GovDist" DROP CONSTRAINT "GovDist_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "countryId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "GovDist_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Language" DROP CONSTRAINT "Language_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "languageName" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "localeCode" SET DATA TYPE VARCHAR(7),
ALTER COLUMN "iso6392" SET DATA TYPE CHAR(3),
ALTER COLUMN "nativeName" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "Language_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgDescription" DROP CONSTRAINT "OrgDescription_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "orgId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgDescription_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgEmail" DROP CONSTRAINT "OrgEmail_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "titleId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "orgId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgEmail_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgHours" DROP CONSTRAINT "OrgHours_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "dayIndex" SET DATA TYPE SMALLINT,
ALTER COLUMN "start" SET DATA TYPE SMALLINT,
ALTER COLUMN "end" SET DATA TYPE SMALLINT,
ALTER COLUMN "orgLocId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "orgServiceId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgHours_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgLocation" DROP CONSTRAINT "OrgLocation_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "street1" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "street2" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "govDistId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "postCode" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "countryId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "orgId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgLocation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgNotes" DROP CONSTRAINT "OrgNotes_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "orgId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgNotes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgPhone" DROP CONSTRAINT "OrgPhone_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "number" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "phoneTypeId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "organizationId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgPhone_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgPhotos" DROP CONSTRAINT "OrgPhotos_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "foursquareId" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "src" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "height" SET DATA TYPE SMALLINT,
ALTER COLUMN "width" SET DATA TYPE SMALLINT,
ALTER COLUMN "orgId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgPhotos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgReview" DROP CONSTRAINT "OrgReview_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "rating" SET DATA TYPE SMALLINT,
ALTER COLUMN "organizationId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "serviceId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgReview_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgService" DROP CONSTRAINT "OrgService_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "organizationId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgService_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgSocialMedia" DROP CONSTRAINT "OrgSocialMedia_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "url" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "serviceId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "organizationId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgSocialMedia_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrgSource" DROP CONSTRAINT "OrgSource_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "source" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "OrgSource_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "sourceId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "Organization_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PhoneType" DROP CONSTRAINT "PhoneType_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "type" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "PhoneType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ServiceCategory" DROP CONSTRAINT "ServiceCategory_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "category" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ServiceType" DROP CONSTRAINT "ServiceType_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "type" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "categoryId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "sessionToken" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "userId" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SocialMediaService" DROP CONSTRAINT "SocialMediaService_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "urlBase" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "logoIcon" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "SocialMediaService_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Translation" ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "categoryId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "itemId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "parentId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "TranslationCategory" ALTER COLUMN "category" SET DATA TYPE VARCHAR(16),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "TranslationItem" ALTER COLUMN "tagName" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "categoryId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "TranslationVariable" ALTER COLUMN "name" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "image" SET DATA TYPE VARCHAR(256),
ALTER COLUMN "birthYear" SET DATA TYPE VARCHAR(4),
ALTER COLUMN "reasonForJoin" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "orgTitleId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "immigrationId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "roleId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "userTypeId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "langPrefId" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserCommunity" DROP CONSTRAINT "UserCommunity_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "community" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "UserCommunity_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserEthnicity" DROP CONSTRAINT "UserEthnicity_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "ethnicity" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "UserEthnicity_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserImmigration" DROP CONSTRAINT "UserImmigration_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "UserImmigration_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserList" DROP CONSTRAINT "UserList_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "ownedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "UserList_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserSOG" DROP CONSTRAINT "UserSOG_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "sog" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "UserSOG_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserTitle" DROP CONSTRAINT "UserTitle_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "text" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "UserTitle_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserType" DROP CONSTRAINT "UserType_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "type" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "langId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "createdById" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "updatedById" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "UserType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "VerificationToken" ALTER COLUMN "identifier" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "token" SET DATA TYPE VARCHAR(128);

-- AlterTable
ALTER TABLE "_CountryToUser" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "_OrgServiceToServiceType" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "_OrganizationToUser" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "_OrganizationToUserList" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "_UserPermissionToUserRole" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "_UserToUserCommunity" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "_UserToUserEthnicity" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "_UserToUserPermission" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "_UserToUserSOG" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "_sharedLists" ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgTitleId_fkey" FOREIGN KEY ("orgTitleId") REFERENCES "UserTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_immigrationId_fkey" FOREIGN KEY ("immigrationId") REFERENCES "UserImmigration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_langPrefId_fkey" FOREIGN KEY ("langPrefId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEthnicity" ADD CONSTRAINT "UserEthnicity_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEthnicity" ADD CONSTRAINT "UserEthnicity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEthnicity" ADD CONSTRAINT "UserEthnicity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImmigration" ADD CONSTRAINT "UserImmigration_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImmigration" ADD CONSTRAINT "UserImmigration_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImmigration" ADD CONSTRAINT "UserImmigration_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSOG" ADD CONSTRAINT "UserSOG_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSOG" ADD CONSTRAINT "UserSOG_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSOG" ADD CONSTRAINT "UserSOG_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserType" ADD CONSTRAINT "UserType_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "UserCommunity" ADD CONSTRAINT "UserCommunity_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCommunity" ADD CONSTRAINT "UserCommunity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCommunity" ADD CONSTRAINT "UserCommunity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_ownedById_fkey" FOREIGN KEY ("ownedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "OrgSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgEmail" ADD CONSTRAINT "OrgEmail_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_govDistId_fkey" FOREIGN KEY ("govDistId") REFERENCES "GovDist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgLocation" ADD CONSTRAINT "OrgLocation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgNotes" ADD CONSTRAINT "OrgNotes_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgNotes" ADD CONSTRAINT "OrgNotes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgNotes" ADD CONSTRAINT "OrgNotes_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_phoneTypeId_fkey" FOREIGN KEY ("phoneTypeId") REFERENCES "PhoneType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhone" ADD CONSTRAINT "OrgPhone_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhotos" ADD CONSTRAINT "OrgPhotos_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhotos" ADD CONSTRAINT "OrgPhotos_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgPhotos" ADD CONSTRAINT "OrgPhotos_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneType" ADD CONSTRAINT "PhoneType_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneType" ADD CONSTRAINT "PhoneType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneType" ADD CONSTRAINT "PhoneType_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgReview" ADD CONSTRAINT "OrgReview_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCategory" ADD CONSTRAINT "ServiceCategory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceType" ADD CONSTRAINT "ServiceType_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceType" ADD CONSTRAINT "ServiceType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceType" ADD CONSTRAINT "ServiceType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceType" ADD CONSTRAINT "ServiceType_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "SocialMediaService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSocialMedia" ADD CONSTRAINT "OrgSocialMedia_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaService" ADD CONSTRAINT "SocialMediaService_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaService" ADD CONSTRAINT "SocialMediaService_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSource" ADD CONSTRAINT "OrgSource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgSource" ADD CONSTRAINT "OrgSource_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryTranslation" ADD CONSTRAINT "CountryTranslation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryTranslation" ADD CONSTRAINT "CountryTranslation_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryTranslation" ADD CONSTRAINT "CountryTranslation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryTranslation" ADD CONSTRAINT "CountryTranslation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovDist" ADD CONSTRAINT "GovDist_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationCategory" ADD CONSTRAINT "TranslationCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationCategory" ADD CONSTRAINT "TranslationCategory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationItem" ADD CONSTRAINT "TranslationItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TranslationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationItem" ADD CONSTRAINT "TranslationItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationItem" ADD CONSTRAINT "TranslationItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_langId_fkey" FOREIGN KEY ("langId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TranslationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "TranslationItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Translation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationVariable" ADD CONSTRAINT "TranslationVariable_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranslationVariable" ADD CONSTRAINT "TranslationVariable_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "_UserToUserPermission" ADD CONSTRAINT "_UserToUserPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserPermission" ADD CONSTRAINT "_UserToUserPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "UserPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedLists" ADD CONSTRAINT "_sharedLists_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedLists" ADD CONSTRAINT "_sharedLists_B_fkey" FOREIGN KEY ("B") REFERENCES "UserList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPermissionToUserRole" ADD CONSTRAINT "_UserPermissionToUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES "UserPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPermissionToUserRole" ADD CONSTRAINT "_UserPermissionToUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUser" ADD CONSTRAINT "_OrganizationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUser" ADD CONSTRAINT "_OrganizationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUserList" ADD CONSTRAINT "_OrganizationToUserList_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToUserList" ADD CONSTRAINT "_OrganizationToUserList_B_fkey" FOREIGN KEY ("B") REFERENCES "UserList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgServiceToServiceType" ADD CONSTRAINT "_OrgServiceToServiceType_A_fkey" FOREIGN KEY ("A") REFERENCES "OrgService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgServiceToServiceType" ADD CONSTRAINT "_OrgServiceToServiceType_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToUser" ADD CONSTRAINT "_CountryToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToUser" ADD CONSTRAINT "_CountryToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
