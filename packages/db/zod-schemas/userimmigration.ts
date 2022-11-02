import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteLanguage, CompleteUser, LanguageModel, UserModel } from './index'

export const _UserImmigrationModel = z.object({
	id: z.string(),
	status: z.string(),
	langId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteUserImmigration extends z.infer<typeof _UserImmigrationModel> {
	users: CompleteUser[]
	language: CompleteLanguage
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
		users: UserModel.array(),
		language: LanguageModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
