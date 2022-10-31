import * as z from 'zod'

import {
	CompleteLanguage,
	CompleteOrgService,
	CompleteServiceCategory,
	CompleteUser,
	LanguageModel,
	OrgServiceModel,
	ServiceCategoryModel,
	UserModel,
} from './index'

export const _ServiceTypeModel = z.object({
	id: z.string(),
	type: z.string(),
	langId: z.string(),
	categoryId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteServiceType extends z.infer<typeof _ServiceTypeModel> {
	language: CompleteLanguage
	category: CompleteServiceCategory
	orgServices: CompleteOrgService[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * ServiceTypeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const ServiceTypeModel: z.ZodSchema<CompleteServiceType> = z.lazy(() =>
	_ServiceTypeModel.extend({
		language: LanguageModel,
		category: ServiceCategoryModel,
		orgServices: OrgServiceModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
