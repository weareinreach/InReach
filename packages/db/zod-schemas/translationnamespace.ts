import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeCategoryModel,
	AuditLogModel,
	CompleteAttributeCategory,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteTranslationKey,
	InternalNoteModel,
	TranslationKeyModel,
} from './index'

export const _TranslationNamespaceModel = z.object({
	id: imports.cuid,
	name: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteTranslationNamespace extends z.infer<typeof _TranslationNamespaceModel> {
	keys: CompleteTranslationKey[]
	attributeCategory: CompleteAttributeCategory[]
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * TranslationNamespaceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationNamespaceModel: z.ZodSchema<CompleteTranslationNamespace> = z.lazy(() =>
	_TranslationNamespaceModel.extend({
		keys: TranslationKeyModel.array(),
		attributeCategory: AttributeCategoryModel.array(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
