import * as z from 'zod'

import { CompleteLanguage, CompleteUser, LanguageModel, UserModel } from './index'

export const _UserCommunityModel = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	community: z.string(),
	langId: z.string(),
	createdById: z.string(),
	updatedById: z.string(),
})

export interface CompleteUserCommunity extends z.infer<typeof _UserCommunityModel> {
	language: CompleteLanguage
	users: CompleteUser[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * UserCommunityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserCommunityModel: z.ZodSchema<CompleteUserCommunity> = z.lazy(() =>
	_UserCommunityModel.extend({
		language: LanguageModel,
		users: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
