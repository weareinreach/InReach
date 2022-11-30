import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	AuditLogModel,
	CompleteAttribute,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteTranslationNamespace,
	InternalNoteModel,
	TranslationNamespaceModel,
} from './index'

export const _AttributeCategoryModel = z.object({
	id: imports.cuid,
	tag: z.string(),
	name: z.string(),
	/** Internal description */
	intDesc: z.string().nullish(),
	namespaceId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteAttributeCategory extends z.infer<typeof _AttributeCategoryModel> {
	namespace: CompleteTranslationNamespace
	attribute: CompleteAttribute[]
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * AttributeCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const AttributeCategoryModel: z.ZodSchema<CompleteAttributeCategory> = z.lazy(() =>
	_AttributeCategoryModel.extend({
		namespace: TranslationNamespaceModel,
		attribute: AttributeModel.array(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
