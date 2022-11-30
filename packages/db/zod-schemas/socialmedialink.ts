import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteSocialMediaService,
	InternalNoteModel,
	SocialMediaServiceModel,
} from './index'

export const _SocialMediaLinkModel = z.object({
	id: imports.cuid,
	href: z.string(),
	icon: z.string(),
	serviceId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteSocialMediaLink extends z.infer<typeof _SocialMediaLinkModel> {
	service: CompleteSocialMediaService
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * SocialMediaLinkModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SocialMediaLinkModel: z.ZodSchema<CompleteSocialMediaLink> = z.lazy(() =>
	_SocialMediaLinkModel.extend({
		service: SocialMediaServiceModel,
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
