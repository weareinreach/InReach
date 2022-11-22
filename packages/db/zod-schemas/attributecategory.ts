import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	CompleteAttribute,
	CompleteInternalNote,
	CompleteTranslationNamespace,
	CompleteUser,
	InternalNoteModel,
	TranslationNamespaceModel,
	UserModel,
} from './index'

export const _AttributeCategoryModel = z.object({
	id: imports.cuid,
	name: z.string(),
	description: z.string().nullish(),
	namespaceId: imports.cuid.nullish(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteAttributeCategory extends z.infer<typeof _AttributeCategoryModel> {
	namespace?: CompleteTranslationNamespace | null
	attribute: CompleteAttribute[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	internalNote: CompleteInternalNote[]
}

/**
 * AttributeCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const AttributeCategoryModel: z.ZodSchema<CompleteAttributeCategory> = z.lazy(() =>
	_AttributeCategoryModel.extend({
		namespace: TranslationNamespaceModel.nullish(),
		attribute: AttributeModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		internalNote: InternalNoteModel.array(),
	})
)
