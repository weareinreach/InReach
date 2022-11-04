import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteCountry,
	CompleteLanguage,
	CompleteTranslationKey,
	CompleteTranslationNamespace,
	CompleteUser,
	CountryModel,
	LanguageModel,
	TranslationKeyModel,
	TranslationNamespaceModel,
	UserModel,
} from './index'

export const _TranslationModel = z.object({
	id: z.string(),
	text: z.string(),
	langId: z.string(),
	namespaceId: z.string(),
	keyId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
	countryId: z.string().nullish(),
})

export interface CompleteTranslation extends z.infer<typeof _TranslationModel> {
	language: CompleteLanguage
	namespace: CompleteTranslationNamespace
	key: CompleteTranslationKey
	createdBy: CompleteUser
	updatedBy: CompleteUser
	Country?: CompleteCountry | null
}

/**
 * TranslationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationModel: z.ZodSchema<CompleteTranslation> = z.lazy(() =>
	_TranslationModel.extend({
		language: LanguageModel,
		namespace: TranslationNamespaceModel,
		key: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		Country: CountryModel.nullish(),
	})
)
