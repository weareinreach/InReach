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

export const _FooterLinkModel = z.object({
	id: imports.cuid,
	display: z.string(),
	href: z.string(),
	icon: z.string().nullish(),
	translationKeyId: z.string(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteFooterLink extends z.infer<typeof _FooterLinkModel> {
	translationKey: CompleteTranslationKey
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * FooterLinkModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const FooterLinkModel: z.ZodSchema<CompleteFooterLink> = z.lazy(() =>
	_FooterLinkModel.extend({
		translationKey: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
