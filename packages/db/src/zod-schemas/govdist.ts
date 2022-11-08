import * as z from 'zod'

import * as imports from '../zod-util'
import {
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
	/** ISO-3166-2 code */
	iso: z.string(),
	/** Name (English/Roman alphabet) */
	name: z.string(),
	/** GeoJSON object - required only if this will be considered a "service area" */
	geoJSON: imports.GeoJSONSchema,
	countryId: imports.cuid,
	govDistTypeId: imports.cuid,
	/** Table can be used for "sub districts" (State -> County -> City) */
	isPrimary: z.boolean().nullish(),
	parentId: z.string().nullish(),
	translationKeyId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteGovDist extends z.infer<typeof _GovDistModel> {
	country: CompleteCountry
	govDistType: CompleteGovDistType
	parent?: CompleteGovDist | null
	subDistricts: CompleteGovDist[]
	translationKey: CompleteTranslationKey
	OrgLocation: CompleteOrgLocation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	OrgReview: CompleteOrgReview[]
	User: CompleteUser[]
	InternalNote: CompleteInternalNote[]
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
		translationKey: TranslationKeyModel,
		OrgLocation: OrgLocationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		OrgReview: OrgReviewModel.array(),
		User: UserModel.array(),
		InternalNote: InternalNoteModel.array(),
	})
)
