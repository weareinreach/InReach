import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteOrgDescription,
	CompleteOrgReview,
	CompleteOrgService,
	CompletePhoneType,
	CompleteUser,
	CompleteUserTitle,
	InternalNoteModel,
	OrgDescriptionModel,
	OrgReviewModel,
	OrgServiceModel,
	PhoneTypeModel,
	UserModel,
	UserTitleModel,
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
	createdById: imports.cuid.nullish(),
	updatedAt: z.date(),
	updatedById: imports.cuid.nullish(),
})

export interface CompleteLanguage extends z.infer<typeof _LanguageModel> {
	orgDescriptions: CompleteOrgDescription[]
	orgService: CompleteOrgService[]
	user: CompleteUser[]
	userTitle: CompleteUserTitle[]
	orgReview: CompleteOrgReview[]
	phoneType: CompletePhoneType[]
	createdBy?: CompleteUser | null
	updatedBy?: CompleteUser | null
	internalNote: CompleteInternalNote[]
}

/**
 * LanguageModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const LanguageModel: z.ZodSchema<CompleteLanguage> = z.lazy(() =>
	_LanguageModel.extend({
		orgDescriptions: OrgDescriptionModel.array(),
		orgService: OrgServiceModel.array(),
		user: UserModel.array(),
		userTitle: UserTitleModel.array(),
		orgReview: OrgReviewModel.array(),
		phoneType: PhoneTypeModel.array(),
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
		internalNote: InternalNoteModel.array(),
	})
)
