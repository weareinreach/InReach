import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	CompleteAttribute,
	CompleteInternalNote,
	CompleteServiceTag,
	CompleteTranslationKey,
	CompleteUser,
	InternalNoteModel,
	ServiceTagModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _ServiceCategoryModel = z.object({
	id: imports.cuid,
	category: z.string(),
	translationKeyId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteServiceCategory extends z.infer<typeof _ServiceCategoryModel> {
	services: CompleteServiceTag[]
	attributes: CompleteAttribute[]
	translationKey: CompleteTranslationKey
	createdBy: CompleteUser
	updatedBy: CompleteUser
	internalNote: CompleteInternalNote[]
}

/**
 * ServiceCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const ServiceCategoryModel: z.ZodSchema<CompleteServiceCategory> = z.lazy(() =>
	_ServiceCategoryModel.extend({
		services: ServiceTagModel.array(),
		attributes: AttributeModel.array(),
		translationKey: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		internalNote: InternalNoteModel.array(),
	})
)
