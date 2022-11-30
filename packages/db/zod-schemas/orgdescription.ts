import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrganization,
	CompleteTranslationKey,
	InternalNoteModel,
	OrganizationModel,
	TranslationKeyModel,
} from './index'

export const _OrgDescriptionModel = z.object({
	id: imports.cuid,
	orgId: imports.cuid,
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteOrgDescription extends z.infer<typeof _OrgDescriptionModel> {
	organization: CompleteOrganization
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * OrgDescriptionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgDescriptionModel: z.ZodSchema<CompleteOrgDescription> = z.lazy(() =>
	_OrgDescriptionModel.extend({
		organization: OrganizationModel,
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
