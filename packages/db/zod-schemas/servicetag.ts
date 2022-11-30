import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	AttributeSupplementModel,
	AuditLogModel,
	CompleteAttribute,
	CompleteAttributeSupplement,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrgService,
	CompleteServiceCategory,
	CompleteTranslationKey,
	InternalNoteModel,
	OrgServiceModel,
	ServiceCategoryModel,
	TranslationKeyModel,
} from './index'

export const _ServiceTagModel = z.object({
	id: imports.cuid,
	name: z.string(),
	keyId: imports.cuid,
	categoryId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteServiceTag extends z.infer<typeof _ServiceTagModel> {
	defaultAttributes: CompleteAttribute[]
	defaultAttributeSupplements: CompleteAttributeSupplement[]
	key: CompleteTranslationKey
	category: CompleteServiceCategory
	orgServices: CompleteOrgService[]
	auditLog: CompleteAuditLog[]
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
		key: TranslationKeyModel,
		category: ServiceCategoryModel,
		/** Tables referencing ServiceTag */
		orgServices: OrgServiceModel.array(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
