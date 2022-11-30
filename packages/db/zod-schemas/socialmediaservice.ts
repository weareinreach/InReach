import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrgSocialMedia,
	CompleteSocialMediaLink,
	CompleteTranslationKey,
	InternalNoteModel,
	OrgSocialMediaModel,
	SocialMediaLinkModel,
	TranslationKeyModel,
} from './index'

export const _SocialMediaServiceModel = z.object({
	id: imports.cuid,
	name: z.string(),
	urlBase: z.string(),
	logoIcon: z.string(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteSocialMediaService extends z.infer<typeof _SocialMediaServiceModel> {
	orgSocialMedia: CompleteOrgSocialMedia[]
	socialMediaLink: CompleteSocialMediaLink[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * SocialMediaServiceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SocialMediaServiceModel: z.ZodSchema<CompleteSocialMediaService> = z.lazy(() =>
	_SocialMediaServiceModel.extend({
		orgSocialMedia: OrgSocialMediaModel.array(),
		socialMediaLink: SocialMediaLinkModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
