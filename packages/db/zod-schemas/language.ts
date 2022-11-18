import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteOrgDescription,
	CompleteOrgReview,
	CompleteOrgService,
	CompletePhoneType,
	CompleteTranslation,
	CompleteUser,
	CompleteUserTitle,
	InternalNoteModel,
	OrgDescriptionModel,
	OrgReviewModel,
	OrgServiceModel,
	PhoneTypeModel,
	TranslationModel,
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
	/** Is this a top level locale (not region specific)? */
	primary: z.boolean(),
	createdAt: z.date(),
	createdById: imports.cuid.nullish(),
	updatedAt: z.date(),
	updatedById: imports.cuid.nullish(),
})

export interface CompleteLanguage extends z.infer<typeof _LanguageModel> {
	translations: CompleteTranslation[]
	orgDescriptions: CompleteOrgDescription[]
	OrgService: CompleteOrgService[]
	User: CompleteUser[]
	createdBy?: CompleteUser | null
	updatedBy?: CompleteUser | null
	UserTitle: CompleteUserTitle[]
	OrgReview: CompleteOrgReview[]
	PhoneType: CompletePhoneType[]
	InternalNote: CompleteInternalNote[]
}

/**
 * LanguageModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const LanguageModel: z.ZodSchema<CompleteLanguage> = z.lazy(() =>
	_LanguageModel.extend({
		translations: TranslationModel.array(),
		orgDescriptions: OrgDescriptionModel.array(),
		OrgService: OrgServiceModel.array(),
		User: UserModel.array(),
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
		UserTitle: UserTitleModel.array(),
		OrgReview: OrgReviewModel.array(),
		PhoneType: PhoneTypeModel.array(),
		InternalNote: InternalNoteModel.array(),
	})
)
