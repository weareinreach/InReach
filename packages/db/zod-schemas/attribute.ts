import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeCategoryModel,
	AttributeSupplementModel,
	AuditLogModel,
	CompleteAttributeCategory,
	CompleteAttributeSupplement,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrgService,
	CompleteOrganization,
	CompleteServiceCategory,
	CompleteServiceTag,
	CompleteTranslationKey,
	InternalNoteModel,
	OrgLocationModel,
	OrgServiceModel,
	OrganizationModel,
	ServiceCategoryModel,
	ServiceTagModel,
	TranslationKeyModel,
} from './index'

export const _AttributeModel = z.object({
	id: imports.cuid,
	tag: z.string(),
	name: z.string(),
	/** Internal description */
	intDesc: z.string().nullish(),
	categoryId: imports.cuid,
	keyId: imports.cuid.nullish(),
	requireText: z.boolean(),
	requireLanguage: z.boolean(),
	requireCountry: z.boolean(),
	requireSupplemental: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
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
	auditLog: CompleteAuditLog[]
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
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
