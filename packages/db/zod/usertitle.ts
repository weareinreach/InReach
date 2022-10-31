import * as z from 'zod'

import {
	CompleteLanguage,
	CompleteOrgEmail,
	CompleteUser,
	LanguageModel,
	OrgEmailModel,
	UserModel,
} from './index'

export const _UserTitleModel = z.object({
	id: z.string(),
	text: z.string(),
	langId: z.string(),
	searchable: z.boolean(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteUserTitle extends z.infer<typeof _UserTitleModel> {
	language: CompleteLanguage
	email: CompleteOrgEmail[]
	orgUser: CompleteUser[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * UserTitleModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserTitleModel: z.ZodSchema<CompleteUserTitle> = z.lazy(() =>
	_UserTitleModel.extend({
		language: LanguageModel,
		email: OrgEmailModel.array(),
		orgUser: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
