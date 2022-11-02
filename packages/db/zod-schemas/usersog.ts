import * as z from 'zod'

import { CompleteLanguage, CompleteUser, LanguageModel, UserModel } from './index'

export const _UserSOGModel = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	langId: z.string(),
	sog: z.string(),
	createdById: z.string(),
	updatedById: z.string(),
})

export interface CompleteUserSOG extends z.infer<typeof _UserSOGModel> {
	language: CompleteLanguage
	users: CompleteUser[]
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
		language: LanguageModel,
		users: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
