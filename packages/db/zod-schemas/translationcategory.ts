import * as z from 'zod'

import {
	CompleteTranslation,
	CompleteTranslationItem,
	CompleteUser,
	TranslationItemModel,
	TranslationModel,
	UserModel,
} from './index'

export const _TranslationCategoryModel = z.object({
	id: z.string(),
	category: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteTranslationCategory extends z.infer<typeof _TranslationCategoryModel> {
	translations: CompleteTranslation[]
	item: CompleteTranslationItem[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * TranslationCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationCategoryModel: z.ZodSchema<CompleteTranslationCategory> = z.lazy(() =>
	_TranslationCategoryModel.extend({
		translations: TranslationModel.array(),
		item: TranslationItemModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
