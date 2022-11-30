import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrgPhone,
	CompleteTranslationKey,
	InternalNoteModel,
	OrgPhoneModel,
	TranslationKeyModel,
} from './index'

export const _PhoneTypeModel = z.object({
	id: imports.cuid,
	type: z.string(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompletePhoneType extends z.infer<typeof _PhoneTypeModel> {
	orgPhone: CompleteOrgPhone[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * PhoneTypeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PhoneTypeModel: z.ZodSchema<CompletePhoneType> = z.lazy(() =>
	_PhoneTypeModel.extend({
		orgPhone: OrgPhoneModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
