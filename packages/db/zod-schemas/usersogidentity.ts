import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteTranslationKey, CompleteUser, TranslationKeyModel, UserModel } from './index'

export const _UserSOGIdentityModel = z.object({
	id: imports.cuid,
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	identifyAs: z.string(),
	translationKeyId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteUserSOGIdentity extends z.infer<typeof _UserSOGIdentityModel> {
	users: CompleteUser[]
	translationKey: CompleteTranslationKey
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * UserSOGIdentityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserSOGIdentityModel: z.ZodSchema<CompleteUserSOGIdentity> = z.lazy(() =>
	_UserSOGIdentityModel.extend({
		users: UserModel.array(),
		translationKey: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
