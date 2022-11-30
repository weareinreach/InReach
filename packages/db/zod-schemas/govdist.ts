import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteCountry,
	CompleteGovDistType,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrgReview,
	CompleteTranslationKey,
	CompleteUser,
	CountryModel,
	GovDistTypeModel,
	InternalNoteModel,
	OrgLocationModel,
	OrgReviewModel,
	TranslationKeyModel,
	UserModel,
} from './index'

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
)

export const _GovDistModel = z.object({
	id: imports.cuid,
	/** Name (English/Roman alphabet) */
	name: z.string(),
	/** Slug - [country (ISO)]-[govdist]-[...] */
	slug: z.string(),
	/** ISO-3166-2 code */
	iso: z.string().nullish(),
	/** Abbreviation (Optional) */
	abbrev: z.string().nullish(),
	/** GeoJSON object - required only if this will be considered a "service area" */
	geoJSON: imports.GeoJSONSchema,
	countryId: imports.cuid,
	govDistTypeId: imports.cuid,
	/** Table can be used for "sub districts" (State -> County -> City) */
	isPrimary: z.boolean().nullish(),
	parentId: imports.cuid.nullish(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteGovDist extends z.infer<typeof _GovDistModel> {
	country: CompleteCountry
	govDistType: CompleteGovDistType
	parent?: CompleteGovDist | null
	subDistricts: CompleteGovDist[]
	key: CompleteTranslationKey
	orgLocation: CompleteOrgLocation[]
	orgReview: CompleteOrgReview[]
	user: CompleteUser[]
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * GovDistModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const GovDistModel: z.ZodSchema<CompleteGovDist> = z.lazy(() =>
	_GovDistModel.extend({
		country: CountryModel,
		govDistType: GovDistTypeModel,
		parent: GovDistModel.nullish(),
		subDistricts: GovDistModel.array(),
		key: TranslationKeyModel,
		/** Tables using GovDist */
		orgLocation: OrgLocationModel.array(),
		orgReview: OrgReviewModel.array(),
		user: UserModel.array(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
