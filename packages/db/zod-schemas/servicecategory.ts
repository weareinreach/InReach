import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteServiceTag,
	CompleteTranslationKey,
	CompleteUser,
	ServiceTagModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _ServiceCategoryModel = z.object({
	id: z.string(),
	category: z.string(),
	translationKeyId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteServiceCategory extends z.infer<typeof _ServiceCategoryModel> {
	services: CompleteServiceTag[]
	translationKey: CompleteTranslationKey
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * ServiceCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const ServiceCategoryModel: z.ZodSchema<CompleteServiceCategory> = z.lazy(() =>
	_ServiceCategoryModel.extend({
		services: ServiceTagModel.array(),
		translationKey: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
