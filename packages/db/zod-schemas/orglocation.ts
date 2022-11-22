import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	CompleteAttribute,
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
	id: imports.cuid,
	street1: z.string(),
	street2: z.string(),
	city: z.string(),
	postCode: z.string().nullish(),
	govDistId: imports.cuid.nullish(),
	countryId: imports.cuid,
	longitude: z.number(),
	latitude: z.number(),
	geoJSON: imports.GeoJSONSchema,
	published: z.boolean(),
	orgId: imports.cuid,
	outsideApiId: imports.cuid.nullish(),
	apiLocationId: z.string().nullish(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteOrgLocation extends z.infer<typeof _OrgLocationModel> {
	govDist?: CompleteGovDist | null
	country: CompleteCountry
	hours: CompleteOrgHours[]
	attributes: CompleteAttribute[]
	organization: CompleteOrganization
	allowedEditors: CompletePermissionAsset[]
	email: CompleteOrgEmail[]
	phone: CompleteOrgPhone[]
	socialMedia: CompleteOrgSocialMedia[]
	photos: CompleteOrgPhoto[]
	outsideApi?: CompleteOutsideAPI | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
	internalNote: CompleteInternalNote[]
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
		attributes: AttributeModel.array(),
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
		internalNote: InternalNoteModel.array(),
	})
)
