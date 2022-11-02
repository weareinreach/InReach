import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteLanguage,
	CompleteOrganization,
	CompleteUser,
	LanguageModel,
	OrganizationModel,
	UserModel,
} from './index'

export const _OrgDescriptionModel = z.object({
	id: z.string(),
	text: z.string(),
	langId: z.string(),
	orgId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgDescription extends z.infer<typeof _OrgDescriptionModel> {
	language: CompleteLanguage
	organization: CompleteOrganization
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgDescriptionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgDescriptionModel: z.ZodSchema<CompleteOrgDescription> = z.lazy(() =>
	_OrgDescriptionModel.extend({
		language: LanguageModel,
		organization: OrganizationModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
