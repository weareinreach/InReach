import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	AttributeSupplementModel,
	CompleteAttribute,
	CompleteAttributeSupplement,
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
	name: z.string(),
	translationKeyId: imports.cuid,
	categoryId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteServiceTag extends z.infer<typeof _ServiceTagModel> {
	defaultAttributes: CompleteAttribute[]
	defaultAttributeSupplements: CompleteAttributeSupplement[]
	translationKey: CompleteTranslationKey
	category: CompleteServiceCategory
	orgServices: CompleteOrgService[]
	orgReview: CompleteOrgReview[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	internalNote: CompleteInternalNote[]
}

/**
 * ServiceTagModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const ServiceTagModel: z.ZodSchema<CompleteServiceTag> = z.lazy(() =>
	_ServiceTagModel.extend({
		defaultAttributes: AttributeModel.array(),
		defaultAttributeSupplements: AttributeSupplementModel.array(),
		translationKey: TranslationKeyModel,
		category: ServiceCategoryModel,
		/** Tables referencing ServiceTag */
		orgServices: OrgServiceModel.array(),
		orgReview: OrgReviewModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		internalNote: InternalNoteModel.array(),
	})
)
