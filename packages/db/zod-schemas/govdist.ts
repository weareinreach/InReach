import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteCountry,
	CompleteGovDistType,
	CompleteOrgLocation,
	CompleteOrgReview,
	CompleteTranslationKey,
	CompleteUser,
	CountryModel,
	GovDistTypeModel,
	OrgLocationModel,
	OrgReviewModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _GovDistModel = z.object({
	id: z.string(),
	/** ISO-3166-2 code */
	iso: z.string(),
	/** Name (English/Roman alphabet) */
	name: z.string(),
	countryId: z.string(),
	govDistTypeId: z.string(),
	translationKeyId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteGovDist extends z.infer<typeof _GovDistModel> {
	country: CompleteCountry
	govDistType: CompleteGovDistType
	translationKey: CompleteTranslationKey
	OrgLocation: CompleteOrgLocation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	OrgReview: CompleteOrgReview[]
	User: CompleteUser[]
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
		translationKey: TranslationKeyModel,
		OrgLocation: OrgLocationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		OrgReview: OrgReviewModel.array(),
		User: UserModel.array(),
	})
)
