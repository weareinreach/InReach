import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrgReview,
	CompleteUser,
	InternalNoteModel,
	OrgReviewModel,
	UserModel,
} from './index'

export const _LanguageModel = z.object({
	id: imports.cuid,
	languageName: z.string(),
	/** ETF BCP 47 language tag */
	localeCode: z.string(),
	/** ISO 639-2 */
	iso6392: z.string().nullish(),
	/** Language name in it's language. */
	nativeName: z.string(),
	/** Is this language being actively used for translations? */
	activelyTranslated: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteLanguage extends z.infer<typeof _LanguageModel> {
	User: CompleteUser[]
	OrgReview: CompleteOrgReview[]
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * LanguageModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const LanguageModel: z.ZodSchema<CompleteLanguage> = z.lazy(() =>
	_LanguageModel.extend({
		User: UserModel.array(),
		OrgReview: OrgReviewModel.array(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
