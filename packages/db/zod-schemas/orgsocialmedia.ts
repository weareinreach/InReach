import * as z from 'zod'

import {
	CompleteOrganization,
	CompleteSocialMediaService,
	CompleteUser,
	OrganizationModel,
	SocialMediaServiceModel,
	UserModel,
} from './index'

export const _OrgSocialMediaModel = z.object({
	id: z.string(),
	username: z.string(),
	serviceId: z.string(),
	url: z.string(),
	organizationId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgSocialMedia extends z.infer<typeof _OrgSocialMediaModel> {
	service: CompleteSocialMediaService
	organization: CompleteOrganization
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgSocialMediaModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgSocialMediaModel: z.ZodSchema<CompleteOrgSocialMedia> = z.lazy(() =>
	_OrgSocialMediaModel.extend({
		service: SocialMediaServiceModel,
		organization: OrganizationModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
