import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteTranslationKey,
	InternalNoteModel,
	TranslationKeyModel,
} from './index'

export const _FooterLinkModel = z.object({
	id: imports.cuid,
	display: z.string(),
	href: z.string(),
	icon: z.string().nullish(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteFooterLink extends z.infer<typeof _FooterLinkModel> {
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * FooterLinkModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const FooterLinkModel: z.ZodSchema<CompleteFooterLink> = z.lazy(() =>
	_FooterLinkModel.extend({
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
