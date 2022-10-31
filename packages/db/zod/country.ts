import * as z from 'zod'

import {
	CompleteCountryTranslation,
	CompleteGovDist,
	CompleteOrgLocation,
	CompleteUser,
	CountryTranslationModel,
	GovDistModel,
	OrgLocationModel,
	UserModel,
} from './index'

export const _CountryModel = z.object({
	id: z.string(),
	name: z.string(),
	govDistName: z.string().nullish(),
	dialCode: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteCountry extends z.infer<typeof _CountryModel> {
	orgAddress: CompleteOrgLocation[]
	countryTranslation: CompleteCountryTranslation[]
	users: CompleteUser[]
	GovDist: CompleteGovDist[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * CountryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CountryModel: z.ZodSchema<CompleteCountry> = z.lazy(() =>
	_CountryModel.extend({
		orgAddress: OrgLocationModel.array(),
		countryTranslation: CountryTranslationModel.array(),
		users: UserModel.array(),
		GovDist: GovDistModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
