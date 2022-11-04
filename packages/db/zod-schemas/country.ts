import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteGovDist,
	CompleteOrgLocation,
	CompleteOrgReview,
	CompleteTranslation,
	CompleteTranslationKey,
	CompleteUser,
	GovDistModel,
	OrgLocationModel,
	OrgReviewModel,
	TranslationKeyModel,
	TranslationModel,
	UserModel,
} from './index'

export const _CountryModel = z.object({
	id: z.string(),
	/** ISO 3166-1 alpha-2 Country code */
	cca2: z.string(),
	/** ISO 3166-1 alpha-3 Country code */
	cca3: z.string(),
	/** Country name (English). Translations are handled elsewhere. */
	name: z.string(),
	/** International dialing code */
	dialCode: z.number().int(),
	/** Country flag (emoji) */
	flag: z.string(),
	translationKeyId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteCountry extends z.infer<typeof _CountryModel> {
	translationKey: CompleteTranslationKey
	GovDist: CompleteGovDist[]
	orgAddress: CompleteOrgLocation[]
	originUsers: CompleteUser[]
	currentUsers: CompleteUser[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	OrgReview: CompleteOrgReview[]
	Translation: CompleteTranslation[]
}

/**
 * CountryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CountryModel: z.ZodSchema<CompleteCountry> = z.lazy(() =>
	_CountryModel.extend({
		translationKey: TranslationKeyModel,
		GovDist: GovDistModel.array(),
		orgAddress: OrgLocationModel.array(),
		originUsers: UserModel.array(),
		currentUsers: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		OrgReview: OrgReviewModel.array(),
		Translation: TranslationModel.array(),
	})
)
