import * as z from 'zod'

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
	organization: CompleteOrganization
	service: CompleteServiceType[]
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
		organization: OrganizationModel,
		service: ServiceTypeModel.array(),
		language: LanguageModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
