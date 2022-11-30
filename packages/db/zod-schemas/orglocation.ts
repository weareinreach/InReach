import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	AttributeSupplementModel,
	AuditLogModel,
	CompleteAttribute,
	CompleteAttributeSupplement,
	CompleteAuditLog,
	CompleteCountry,
	CompleteGovDist,
	CompleteInternalNote,
	CompleteOrgEmail,
	CompleteOrgHours,
	CompleteOrgPhone,
	CompleteOrgPhoto,
	CompleteOrgService,
	CompleteOrgSocialMedia,
	CompleteOrganization,
	CompleteOutsideAPI,
	CompletePermissionAsset,
	CountryModel,
	GovDistModel,
	InternalNoteModel,
	OrgEmailModel,
	OrgHoursModel,
	OrgPhoneModel,
	OrgPhotoModel,
	OrgServiceModel,
	OrgSocialMediaModel,
	OrganizationModel,
	OutsideAPIModel,
	PermissionAssetModel,
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
	name: z.string().nullish(),
	street1: z.string(),
	street2: z.string().nullish(),
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
	updatedAt: z.date(),
})

export interface CompleteOrgLocation extends z.infer<typeof _OrgLocationModel> {
	govDist?: CompleteGovDist | null
	country: CompleteCountry
	hours: CompleteOrgHours[]
	attributes: CompleteAttribute[]
	attributeSupplement: CompleteAttributeSupplement[]
	organization: CompleteOrganization
	allowedEditors: CompletePermissionAsset[]
	email: CompleteOrgEmail[]
	phone: CompleteOrgPhone[]
	socialMedia: CompleteOrgSocialMedia[]
	photos: CompleteOrgPhoto[]
	services: CompleteOrgService[]
	outsideApi?: CompleteOutsideAPI | null
	auditLog: CompleteAuditLog[]
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
		attributeSupplement: AttributeSupplementModel.array(),
		organization: OrganizationModel,
		allowedEditors: PermissionAssetModel.array(),
		/** If location specific */
		email: OrgEmailModel.array(),
		/** If location specific */
		phone: OrgPhoneModel.array(),
		/** If location specific */
		socialMedia: OrgSocialMediaModel.array(),
		photos: OrgPhotoModel.array(),
		services: OrgServiceModel.array(),
		outsideApi: OutsideAPIModel.nullish(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
