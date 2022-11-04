import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteOrgDescription,
	CompleteOrgEmail,
	CompleteOrgLocation,
	CompleteOrgNotes,
	CompleteOrgPhone,
	CompleteOrgPhoto,
	CompleteOrgReview,
	CompleteOrgService,
	CompleteOrgSocialMedia,
	CompleteOutsideAPI,
	CompletePermissionAsset,
	CompleteSource,
	CompleteUser,
	CompleteUserSavedList,
	OrgDescriptionModel,
	OrgEmailModel,
	OrgLocationModel,
	OrgNotesModel,
	OrgPhoneModel,
	OrgPhotoModel,
	OrgReviewModel,
	OrgServiceModel,
	OrgSocialMediaModel,
	OutsideAPIModel,
	PermissionAssetModel,
	SourceModel,
	UserModel,
	UserSavedListModel,
} from './index'

export const _OrganizationModel = z.object({
	id: z.string(),
	legacyId: z.string().nullish(),
	name: z.string(),
	slug: z.string(),
	deleted: z.boolean(),
	published: z.boolean(),
	outsideApiId: z.string().nullish(),
	apiLocationId: z.string().nullish(),
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
	phone: CompleteOrgPhone[]
	photos: CompleteOrgPhoto[]
	services: CompleteOrgService[]
	orgSocialMedia: CompleteOrgSocialMedia[]
	userList: CompleteUserSavedList[]
	associatedUsers: CompleteUser[]
	allowedEditors: CompletePermissionAsset[]
	outsideApi?: CompleteOutsideAPI | null
	source: CompleteSource
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
		phone: OrgPhoneModel.array(),
		photos: OrgPhotoModel.array(),
		services: OrgServiceModel.array(),
		orgSocialMedia: OrgSocialMediaModel.array(),
		userList: UserSavedListModel.array(),
		associatedUsers: UserModel.array(),
		allowedEditors: PermissionAssetModel.array(),
		outsideApi: OutsideAPIModel.nullish(),
		source: SourceModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		OrgReview: OrgReviewModel.array(),
	})
)
