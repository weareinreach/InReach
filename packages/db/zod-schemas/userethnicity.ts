import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteLanguage, CompleteUser, LanguageModel, UserModel } from './index'

export const _UserEthnicityModel = z.object({
	id: z.string(),
	ethnicity: z.string(),
	langId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteUserEthnicity extends z.infer<typeof _UserEthnicityModel> {
	users: CompleteUser[]
	language: CompleteLanguage
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * UserEthnicityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserEthnicityModel: z.ZodSchema<CompleteUserEthnicity> = z.lazy(() =>
	_UserEthnicityModel.extend({
		users: UserModel.array(),
		language: LanguageModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
