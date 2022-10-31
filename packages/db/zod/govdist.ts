import * as z from 'zod'

import {
	CompleteCountry,
	CompleteLanguage,
	CompleteOrgLocation,
	CompleteUser,
	CountryModel,
	LanguageModel,
	OrgLocationModel,
	UserModel,
} from './index'

export const _GovDistModel = z.object({
	id: z.string(),
	name: z.string(),
	countryId: z.string(),
	langId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteGovDist extends z.infer<typeof _GovDistModel> {
	country: CompleteCountry
	language: CompleteLanguage
	OrgLocation: CompleteOrgLocation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * GovDistModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const GovDistModel: z.ZodSchema<CompleteGovDist> = z.lazy(() =>
	_GovDistModel.extend({
		country: CountryModel,
		language: LanguageModel,
		OrgLocation: OrgLocationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
