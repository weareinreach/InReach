import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteLanguage,
	CompleteTranslationKey,
	CompleteTranslationNamespace,
	CompleteUser,
	InternalNoteModel,
	LanguageModel,
	TranslationKeyModel,
	TranslationNamespaceModel,
	UserModel,
} from './index'

export const _TranslationModel = z.object({
	id: z.string().cuid(),
	text: z.string(),
	langId: z.string().cuid(),
	namespaceId: z.string().cuid(),
	keyId: z.string().cuid(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteTranslation extends z.infer<typeof _TranslationModel> {
	language: CompleteLanguage
	namespace: CompleteTranslationNamespace
	key: CompleteTranslationKey
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
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
		InternalNote: InternalNoteModel.array(),
	})
)
