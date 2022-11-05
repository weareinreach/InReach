import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteTranslation,
	CompleteTranslationKey,
	CompleteUser,
	InternalNoteModel,
	TranslationKeyModel,
	TranslationModel,
	UserModel,
} from './index'

export const _TranslationNamespaceModel = z.object({
	id: z.string().cuid(),
	name: z.string(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteTranslationNamespace extends z.infer<typeof _TranslationNamespaceModel> {
	translations: CompleteTranslation[]
	item: CompleteTranslationKey[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * TranslationNamespaceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationNamespaceModel: z.ZodSchema<CompleteTranslationNamespace> = z.lazy(() =>
	_TranslationNamespaceModel.extend({
		translations: TranslationModel.array(),
		item: TranslationKeyModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
