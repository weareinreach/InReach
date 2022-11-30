import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteGovDist,
	CompleteInternalNote,
	CompleteTranslationKey,
	GovDistModel,
	InternalNoteModel,
	TranslationKeyModel,
} from './index'

export const _GovDistTypeModel = z.object({
	id: imports.cuid,
	name: z.string(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteGovDistType extends z.infer<typeof _GovDistTypeModel> {
	govDist: CompleteGovDist[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * GovDistTypeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const GovDistTypeModel: z.ZodSchema<CompleteGovDistType> = z.lazy(() =>
	_GovDistTypeModel.extend({
		govDist: GovDistModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
