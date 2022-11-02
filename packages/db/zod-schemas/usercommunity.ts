import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteLanguage, CompleteUser, LanguageModel, UserModel } from './index'

export const _UserCommunityModel = z.object({
	id: z.string(),
	community: z.string(),
	langId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteUserCommunity extends z.infer<typeof _UserCommunityModel> {
	users: CompleteUser[]
	language: CompleteLanguage
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
		users: UserModel.array(),
		language: LanguageModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
