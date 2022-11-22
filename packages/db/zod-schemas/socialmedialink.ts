import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteTranslationKey,
	CompleteUser,
	InternalNoteModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _SocialMediaLinkModel = z.object({
	id: imports.cuid,
	service: z.string(),
	href: z.string(),
	icon: z.string(),
	translationKeyId: z.string(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteSocialMediaLink extends z.infer<typeof _SocialMediaLinkModel> {
	translationKey: CompleteTranslationKey
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * SocialMediaLinkModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SocialMediaLinkModel: z.ZodSchema<CompleteSocialMediaLink> = z.lazy(() =>
	_SocialMediaLinkModel.extend({
		translationKey: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
