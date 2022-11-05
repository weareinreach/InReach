import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteLanguage,
	CompleteOrgPhone,
	CompleteUser,
	LanguageModel,
	OrgPhoneModel,
	UserModel,
} from './index'

export const _PhoneTypeModel = z.object({
	id: imports.cuid,
	type: z.string(),
	langId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompletePhoneType extends z.infer<typeof _PhoneTypeModel> {
	orgPhone: CompleteOrgPhone[]
	language: CompleteLanguage
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
		orgPhone: OrgPhoneModel.array(),
		language: LanguageModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
