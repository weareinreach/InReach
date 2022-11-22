import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeCategoryModel,
	CompleteAttributeCategory,
	CompleteInternalNote,
	CompleteTranslationKey,
	CompleteUser,
	InternalNoteModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _TranslationNamespaceModel = z.object({
	id: imports.cuid,
	name: z.string(),
	createdAt: z.date(),
	createdById: imports.cuid.nullish(),
	updatedAt: z.date(),
	updatedById: imports.cuid.nullish(),
})

export interface CompleteTranslationNamespace extends z.infer<typeof _TranslationNamespaceModel> {
	keys: CompleteTranslationKey[]
	attributeCategory: CompleteAttributeCategory[]
	createdBy?: CompleteUser | null
	updatedBy?: CompleteUser | null
	internalNote: CompleteInternalNote[]
}

/**
 * TranslationNamespaceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationNamespaceModel: z.ZodSchema<CompleteTranslationNamespace> = z.lazy(() =>
	_TranslationNamespaceModel.extend({
		keys: TranslationKeyModel.array(),
		attributeCategory: AttributeCategoryModel.array(),
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
		internalNote: InternalNoteModel.array(),
	})
)
