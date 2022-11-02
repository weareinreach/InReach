import * as z from 'zod'

import { CompleteLanguage, CompleteUser, LanguageModel, UserModel } from './index'

export const _UserTypeModel = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	langId: z.string().nullish(),
	type: z.string(),
	createdById: z.string().nullish(),
	updatedById: z.string().nullish(),
})

export interface CompleteUserType extends z.infer<typeof _UserTypeModel> {
	language?: CompleteLanguage | null
	users: CompleteUser[]
	createdBy?: CompleteUser | null
	updatedBy?: CompleteUser | null
}

/**
 * UserTypeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserTypeModel: z.ZodSchema<CompleteUserType> = z.lazy(() =>
	_UserTypeModel.extend({
		language: LanguageModel.nullish(),
		users: UserModel.array(),
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
	})
)
