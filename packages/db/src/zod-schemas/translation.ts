import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteLanguage,
	CompleteTranslationKey,
	CompleteUser,
	InternalNoteModel,
	LanguageModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _TranslationModel = z.object({
	id: imports.cuid,
	text: z.string(),
	langId: imports.cuid,
	keyId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteTranslation extends z.infer<typeof _TranslationModel> {
	language: CompleteLanguage
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
		key: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
