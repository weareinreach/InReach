import * as z from 'zod'

import { CompleteLanguage, CompleteUser, LanguageModel, UserModel } from './index'

export const _UserImmigrationModel = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	langId: z.string(),
	status: z.string(),
	createdById: z.string(),
	updatedById: z.string(),
})

export interface CompleteUserImmigration extends z.infer<typeof _UserImmigrationModel> {
	language: CompleteLanguage
	users: CompleteUser[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * UserImmigrationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserImmigrationModel: z.ZodSchema<CompleteUserImmigration> = z.lazy(() =>
	_UserImmigrationModel.extend({
		language: LanguageModel,
		users: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
