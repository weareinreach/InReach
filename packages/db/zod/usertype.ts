import * as z from 'zod'

import { CompleteLanguage, CompleteUser, LanguageModel, UserModel } from './index'

export const _UserTypeModel = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	langId: z.string(),
	type: z.string(),
	createdById: z.string(),
	updatedById: z.string(),
})

export interface CompleteUserType extends z.infer<typeof _UserTypeModel> {
	language: CompleteLanguage
	users: CompleteUser[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * UserTypeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserTypeModel: z.ZodSchema<CompleteUserType> = z.lazy(() =>
	_UserTypeModel.extend({
		language: LanguageModel,
		users: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
