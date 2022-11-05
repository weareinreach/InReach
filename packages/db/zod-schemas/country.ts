import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteGovDist,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrgReview,
	CompleteTranslationKey,
	CompleteUser,
	GovDistModel,
	InternalNoteModel,
	OrgLocationModel,
	OrgReviewModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _CountryModel = z.object({
	id: z.string().cuid(),
	/** ISO 3166-1 alpha-2 Country code */
	cca2: z.string(),
	/** ISO 3166-1 alpha-3 Country code */
	cca3: z.string(),
	/** Country name (English). */
	name: z.string(),
	/** International dialing code */
	dialCode: z.number().int(),
	/** Country flag (emoji) */
	flag: z.string(),
	translationKeyId: z.string().cuid(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteCountry extends z.infer<typeof _CountryModel> {
	translationKey: CompleteTranslationKey
	govDist: CompleteGovDist[]
	orgAddress: CompleteOrgLocation[]
	orgReviews: CompleteOrgReview[]
	originUsers: CompleteUser[]
	currentUsers: CompleteUser[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * CountryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CountryModel: z.ZodSchema<CompleteCountry> = z.lazy(() =>
	_CountryModel.extend({
		translationKey: TranslationKeyModel,
		govDist: GovDistModel.array(),
		orgAddress: OrgLocationModel.array(),
		orgReviews: OrgReviewModel.array(),
		originUsers: UserModel.array(),
		currentUsers: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
