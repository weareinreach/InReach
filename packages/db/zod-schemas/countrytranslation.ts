import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteCountry,
	CompleteLanguage,
	CompleteUser,
	CountryModel,
	LanguageModel,
	UserModel,
} from './index'

export const _CountryTranslationModel = z.object({
	id: z.string(),
	name: z.string(),
	govDistName: z.string().nullish(),
	countryId: z.string(),
	langId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteCountryTranslation extends z.infer<typeof _CountryTranslationModel> {
	country: CompleteCountry
	language: CompleteLanguage
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * CountryTranslationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CountryTranslationModel: z.ZodSchema<CompleteCountryTranslation> = z.lazy(() =>
	_CountryTranslationModel.extend({
		country: CountryModel,
		language: LanguageModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
