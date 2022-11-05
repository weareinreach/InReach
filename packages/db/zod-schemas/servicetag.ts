import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteOrgReview,
	CompleteOrgService,
	CompleteServiceCategory,
	CompleteTranslationKey,
	CompleteUser,
	InternalNoteModel,
	OrgReviewModel,
	OrgServiceModel,
	ServiceCategoryModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _ServiceTagModel = z.object({
	id: imports.cuid,
	type: z.string(),
	translationKeyId: imports.cuid,
	categoryId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteServiceTag extends z.infer<typeof _ServiceTagModel> {
	translationKey: CompleteTranslationKey
	category: CompleteServiceCategory
	orgServices: CompleteOrgService[]
	OrgReview: CompleteOrgReview[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
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
		InternalNote: InternalNoteModel.array(),
	})
)
