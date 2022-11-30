import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteGovDist,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrgPhone,
	CompleteOrgReview,
	CompleteTranslationKey,
	CompleteUser,
	GovDistModel,
	InternalNoteModel,
	OrgLocationModel,
	OrgPhoneModel,
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

export const _CountryModel = z.object({
	id: imports.cuid,
	/** ISO 3166-1 alpha-2 Country code */
	cca2: z.string(),
	/** ISO 3166-1 alpha-3 Country code */
	cca3: z.string(),
	/** Country name (English). */
	name: z.string(),
	/** International dialing code */
	dialCode: z.number().int().nullish(),
	/** Country flag (emoji) */
	flag: z.string(),
	/** GeoJSON object - required only if this will be considered a "service area" */
	geoJSON: imports.GeoJSONSchema,
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteCountry extends z.infer<typeof _CountryModel> {
	key: CompleteTranslationKey
	govDist: CompleteGovDist[]
	orgAddress: CompleteOrgLocation[]
	orgReviews: CompleteOrgReview[]
	orgPhone: CompleteOrgPhone[]
	originUsers: CompleteUser[]
	currentUsers: CompleteUser[]
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * CountryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CountryModel: z.ZodSchema<CompleteCountry> = z.lazy(() =>
	_CountryModel.extend({
		key: TranslationKeyModel,
		govDist: GovDistModel.array(),
		/** Tables using Country */
		orgAddress: OrgLocationModel.array(),
		orgReviews: OrgReviewModel.array(),
		orgPhone: OrgPhoneModel.array(),
		originUsers: UserModel.array(),
		currentUsers: UserModel.array(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
