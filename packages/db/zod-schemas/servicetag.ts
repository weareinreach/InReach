import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteOrgReview,
	CompleteOrgService,
	CompleteServiceCategory,
	CompleteTranslationKey,
	CompleteUser,
	OrgReviewModel,
	OrgServiceModel,
	ServiceCategoryModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _ServiceTagModel = z.object({
	id: z.string(),
	type: z.string(),
	translationKeyId: z.string(),
	categoryId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteServiceTag extends z.infer<typeof _ServiceTagModel> {
	translationKey: CompleteTranslationKey
	category: CompleteServiceCategory
	orgServices: CompleteOrgService[]
	OrgReview: CompleteOrgReview[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * ServiceTagModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const ServiceTagModel: z.ZodSchema<CompleteServiceTag> = z.lazy(() =>
	_ServiceTagModel.extend({
		translationKey: TranslationKeyModel,
		category: ServiceCategoryModel,
		orgServices: OrgServiceModel.array(),
		OrgReview: OrgReviewModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
