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
	CompleteServiceTag,
	CompleteTranslationKey,
	InternalNoteModel,
	ServiceTagModel,
	TranslationKeyModel,
} from './index'

export const _ServiceCategoryModel = z.object({
	id: imports.cuid,
	category: z.string(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteServiceCategory extends z.infer<typeof _ServiceCategoryModel> {
	services: CompleteServiceTag[]
	defaultAttributes: CompleteAttribute[]
	defaultAttributeSupplements: CompleteAttributeSupplement[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * ServiceCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const ServiceCategoryModel: z.ZodSchema<CompleteServiceCategory> = z.lazy(() =>
	_ServiceCategoryModel.extend({
		services: ServiceTagModel.array(),
		defaultAttributes: AttributeModel.array(),
		defaultAttributeSupplements: AttributeSupplementModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
