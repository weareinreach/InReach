import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteLanguage,
	CompleteOrgEmail,
	CompleteUser,
	LanguageModel,
	OrgEmailModel,
	UserModel,
} from './index'

export const _UserTitleModel = z.object({
	id: imports.cuid,
	text: z.string(),
	searchable: z.boolean(),
	langId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteUserTitle extends z.infer<typeof _UserTitleModel> {
	email: CompleteOrgEmail[]
	orgUser: CompleteUser[]
	language: CompleteLanguage
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
		email: OrgEmailModel.array(),
		orgUser: UserModel.array(),
		language: LanguageModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
