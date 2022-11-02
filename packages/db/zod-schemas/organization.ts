import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteOrgDescription,
	CompleteOrgEmail,
	CompleteOrgLocation,
	CompleteOrgNotes,
	CompleteOrgPhone,
	CompleteOrgPhotos,
	CompleteOrgReview,
	CompleteOrgService,
	CompleteOrgSocialMedia,
	CompleteOrgSource,
	CompleteUser,
	CompleteUserList,
	OrgDescriptionModel,
	OrgEmailModel,
	OrgLocationModel,
	OrgNotesModel,
	OrgPhoneModel,
	OrgPhotosModel,
	OrgReviewModel,
	OrgServiceModel,
	OrgSocialMediaModel,
	OrgSourceModel,
	UserListModel,
	UserModel,
} from './index'

export const _OrganizationModel = z.object({
	id: z.string(),
	deleted: z.boolean(),
	published: z.boolean(),
	name: z.string(),
	sourceId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrganization extends z.infer<typeof _OrganizationModel> {
	description: CompleteOrgDescription[]
	email: CompleteOrgEmail[]
	location: CompleteOrgLocation[]
	notes: CompleteOrgNotes[]
	owner: CompleteUser[]
	phone: CompleteOrgPhone[]
	photos: CompleteOrgPhotos[]
	services: CompleteOrgService[]
	orgSocialMedia: CompleteOrgSocialMedia[]
	userList: CompleteUserList[]
	source: CompleteOrgSource
	createdBy: CompleteUser
	updatedBy: CompleteUser
	OrgReview: CompleteOrgReview[]
}

/**
 * OrganizationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrganizationModel: z.ZodSchema<CompleteOrganization> = z.lazy(() =>
	_OrganizationModel.extend({
		description: OrgDescriptionModel.array(),
		email: OrgEmailModel.array(),
		location: OrgLocationModel.array(),
		notes: OrgNotesModel.array(),
		owner: UserModel.array(),
		phone: OrgPhoneModel.array(),
		photos: OrgPhotosModel.array(),
		services: OrgServiceModel.array(),
		orgSocialMedia: OrgSocialMediaModel.array(),
		userList: UserListModel.array(),
		source: OrgSourceModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		OrgReview: OrgReviewModel.array(),
	})
)
