import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteLanguage, CompleteUser, LanguageModel, UserModel } from './index'

export const _UserTypeModel = z.object({
	id: z.string(),
	type: z.string(),
	langId: z.string().nullish(),
	createdAt: z.date(),
	createdById: z.string().nullish(),
	updatedAt: z.date(),
	updatedById: z.string().nullish(),
})

export interface CompleteUserType extends z.infer<typeof _UserTypeModel> {
	users: CompleteUser[]
	language?: CompleteLanguage | null
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
		users: UserModel.array(),
		language: LanguageModel.nullish(),
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
	})
)
