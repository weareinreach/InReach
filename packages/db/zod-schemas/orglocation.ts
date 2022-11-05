import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteCountry,
	CompleteGovDist,
	CompleteInternalNote,
	CompleteOrgEmail,
	CompleteOrgHours,
	CompleteOrgPhone,
	CompleteOrgPhoto,
	CompleteOrgSocialMedia,
	CompleteOrganization,
	CompleteOutsideAPI,
	CompletePermissionAsset,
	CompleteUser,
	CountryModel,
	GovDistModel,
	InternalNoteModel,
	OrgEmailModel,
	OrgHoursModel,
	OrgPhoneModel,
	OrgPhotoModel,
	OrgSocialMediaModel,
	OrganizationModel,
	OutsideAPIModel,
	PermissionAssetModel,
	UserModel,
} from './index'

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
)

export const _OrgLocationModel = z.object({
	id: z.string().cuid(),
	street1: z.string(),
	street2: z.string(),
	city: z.string(),
	postCode: z.string().nullish(),
	govDistId: z.string().cuid().nullish(),
	countryId: z.string().cuid(),
	longitude: z.number(),
	latitude: z.number(),
	geoJSON: imports.GeoJSONSchema,
	published: z.boolean(),
	orgId: z.string().cuid(),
	outsideApiId: z.string().cuid().nullish(),
	apiLocationId: z.string().nullish(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteOrgLocation extends z.infer<typeof _OrgLocationModel> {
	govDist?: CompleteGovDist | null
	country: CompleteCountry
	hours: CompleteOrgHours[]
	organization: CompleteOrganization
	allowedEditors: CompletePermissionAsset[]
	email: CompleteOrgEmail[]
	phone: CompleteOrgPhone[]
	socialMedia: CompleteOrgSocialMedia[]
	photos: CompleteOrgPhoto[]
	outsideApi?: CompleteOutsideAPI | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * OrgLocationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgLocationModel: z.ZodSchema<CompleteOrgLocation> = z.lazy(() =>
	_OrgLocationModel.extend({
		govDist: GovDistModel.nullish(),
		country: CountryModel,
		hours: OrgHoursModel.array(),
		organization: OrganizationModel,
		allowedEditors: PermissionAssetModel.array(),
		/** If location specific */
		email: OrgEmailModel.array(),
		/** If location specific */
		phone: OrgPhoneModel.array(),
		/** If location specific */
		socialMedia: OrgSocialMediaModel.array(),
		photos: OrgPhotoModel.array(),
		outsideApi: OutsideAPIModel.nullish(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
