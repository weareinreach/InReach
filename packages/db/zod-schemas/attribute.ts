import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeCategoryModel,
	AttributeSupplementModel,
	CompleteAttributeCategory,
	CompleteAttributeSupplement,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrgService,
	CompleteOrganization,
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteTranslationKey,
	CompleteUser,
	InternalNoteModel,
	OrgLocationModel,
	OrgServiceModel,
	OrganizationModel,
	ServiceCategoryModel,
	ServiceTagModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _AttributeModel = z.object({
	id: imports.cuid,
	tag: z.string(),
	name: z.string(),
	description: z.string().nullish(),
	categoryId: imports.cuid,
	keyId: imports.cuid.nullish(),
	requireLanguage: z.boolean(),
	requireCountry: z.boolean(),
	requireSupplemental: z.boolean(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteAttribute extends z.infer<typeof _AttributeModel> {
	category: CompleteAttributeCategory
	key?: CompleteTranslationKey | null
	organization: CompleteOrganization[]
	orgLocation: CompleteOrgLocation[]
	orgService: CompleteOrgService[]
	serviceCategory: CompleteServiceCategory[]
	serviceTag: CompleteServiceTag[]
	attributeSupplement: CompleteAttributeSupplement[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	internalNote: CompleteInternalNote[]
}

/**
 * AttributeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const AttributeModel: z.ZodSchema<CompleteAttribute> = z.lazy(() =>
	_AttributeModel.extend({
		category: AttributeCategoryModel,
		key: TranslationKeyModel.nullish(),
		/** Tables using Attribute */
		organization: OrganizationModel.array(),
		orgLocation: OrgLocationModel.array(),
		orgService: OrgServiceModel.array(),
		serviceCategory: ServiceCategoryModel.array(),
		serviceTag: ServiceTagModel.array(),
		attributeSupplement: AttributeSupplementModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		internalNote: InternalNoteModel.array(),
	})
)
