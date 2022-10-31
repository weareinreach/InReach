import * as z from 'zod'

import {
	CompleteLanguage,
	CompleteOrgPhone,
	CompleteUser,
	LanguageModel,
	OrgPhoneModel,
	UserModel,
} from './index'

export const _PhoneTypeModel = z.object({
	id: z.string(),
	type: z.string(),
	langId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompletePhoneType extends z.infer<typeof _PhoneTypeModel> {
	language: CompleteLanguage
	orgPhone: CompleteOrgPhone[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * PhoneTypeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PhoneTypeModel: z.ZodSchema<CompletePhoneType> = z.lazy(() =>
	_PhoneTypeModel.extend({
		language: LanguageModel,
		orgPhone: OrgPhoneModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
