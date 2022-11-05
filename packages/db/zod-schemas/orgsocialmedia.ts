import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrganization,
	CompleteSocialMediaService,
	CompleteUser,
	InternalNoteModel,
	OrgLocationModel,
	OrganizationModel,
	SocialMediaServiceModel,
	UserModel,
} from './index'

export const _OrgSocialMediaModel = z.object({
	id: z.string().cuid(),
	username: z.string(),
	url: z.string(),
	serviceId: z.string().cuid(),
	organizationId: z.string().cuid(),
	/** Associated only with location and not overall organization (for large orgs w/ multiple locations) */
	orgLocationOnly: z.boolean(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteOrgSocialMedia extends z.infer<typeof _OrgSocialMediaModel> {
	service: CompleteSocialMediaService
	organization: CompleteOrganization
	orgLocation: CompleteOrgLocation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
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
		orgLocation: OrgLocationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
