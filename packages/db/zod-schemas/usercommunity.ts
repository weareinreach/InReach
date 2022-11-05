import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteTranslationKey, CompleteUser, TranslationKeyModel, UserModel } from './index'

export const _UserCommunityModel = z.object({
	id: z.string().cuid(),
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	community: z.string(),
	translationKeyId: z.string().cuid(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteUserCommunity extends z.infer<typeof _UserCommunityModel> {
	users: CompleteUser[]
	translationKey: CompleteTranslationKey
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
		translationKey: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
