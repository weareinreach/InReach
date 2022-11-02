import * as z from 'zod'

import {
	CompleteTranslation,
	CompleteTranslationCategory,
	CompleteUser,
	TranslationCategoryModel,
	TranslationModel,
	UserModel,
} from './index'

export const _TranslationItemModel = z.object({
	id: z.string(),
	tagName: z.string(),
	categoryId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteTranslationItem extends z.infer<typeof _TranslationItemModel> {
	category: CompleteTranslationCategory
	translations: CompleteTranslation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * TranslationItemModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationItemModel: z.ZodSchema<CompleteTranslationItem> = z.lazy(() =>
	_TranslationItemModel.extend({
		category: TranslationCategoryModel,
		translations: TranslationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
