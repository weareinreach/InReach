import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteTranslationKey, CompleteUser, TranslationKeyModel, UserModel } from './index'

export const _UserSOGModel = z.object({
	id: imports.cuid,
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	sog: z.string(),
	translationKeyId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteUserSOG extends z.infer<typeof _UserSOGModel> {
	users: CompleteUser[]
	translationKey: CompleteTranslationKey
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * UserSOGModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserSOGModel: z.ZodSchema<CompleteUserSOG> = z.lazy(() =>
	_UserSOGModel.extend({
		users: UserModel.array(),
		translationKey: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
