import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteLanguage,
	CompleteOrgHours,
	CompleteOrganization,
	CompleteServiceType,
	CompleteUser,
	LanguageModel,
	OrgHoursModel,
	OrganizationModel,
	ServiceTypeModel,
	UserModel,
} from './index'

export const _OrgServiceModel = z.object({
	id: z.string(),
	published: z.boolean(),
	accessInstructions: z.string(),
	description: z.string(),
	organizationId: z.string(),
	langId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgService extends z.infer<typeof _OrgServiceModel> {
	hours: CompleteOrgHours[]
	service: CompleteServiceType[]
	organization: CompleteOrganization
	language: CompleteLanguage
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgServiceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgServiceModel: z.ZodSchema<CompleteOrgService> = z.lazy(() =>
	_OrgServiceModel.extend({
		hours: OrgHoursModel.array(),
		service: ServiceTypeModel.array(),
		organization: OrganizationModel,
		language: LanguageModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
