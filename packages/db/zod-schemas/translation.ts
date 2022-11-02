import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteLanguage,
	CompleteTranslationCategory,
	CompleteTranslationItem,
	CompleteTranslationVariable,
	CompleteUser,
	LanguageModel,
	TranslationCategoryModel,
	TranslationItemModel,
	TranslationVariableModel,
	UserModel,
} from './index'

export const _TranslationModel = z.object({
	id: z.string(),
	text: z.string(),
	langId: z.string(),
	categoryId: z.string(),
	itemId: z.string(),
	isBase: z.boolean(),
	useDigits: z.boolean(),
	parentId: z.string().nullish(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteTranslation extends z.infer<typeof _TranslationModel> {
	language: CompleteLanguage
	category: CompleteTranslationCategory
	item: CompleteTranslationItem
	variables: CompleteTranslationVariable[]
	children: CompleteTranslation[]
	parent?: CompleteTranslation | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * TranslationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationModel: z.ZodSchema<CompleteTranslation> = z.lazy(() =>
	_TranslationModel.extend({
		language: LanguageModel,
		category: TranslationCategoryModel,
		item: TranslationItemModel,
		variables: TranslationVariableModel.array(),
		children: TranslationModel.array(),
		parent: TranslationModel.nullish(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
