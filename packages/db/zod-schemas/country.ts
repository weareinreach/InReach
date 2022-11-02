import * as z from 'zod'

import * as imports from '../zod-util'
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
	cca3: z.string(),
	name: z.string(),
	govDistName: z.string().nullish(),
	dialCode: z.string(),
	flag: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteCountry extends z.infer<typeof _CountryModel> {
	countryTranslation: CompleteCountryTranslation[]
	GovDist: CompleteGovDist[]
	orgAddress: CompleteOrgLocation[]
	users: CompleteUser[]
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
		countryTranslation: CountryTranslationModel.array(),
		GovDist: GovDistModel.array(),
		orgAddress: OrgLocationModel.array(),
		users: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
