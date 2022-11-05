import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteOrgDescription,
	CompleteOrgEmail,
	CompleteOrgLocation,
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
	InternalNoteModel,
	OrgDescriptionModel,
	OrgEmailModel,
	OrgLocationModel,
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
	id: z.string().cuid(),
	/** Old ID from MongoDB */
	legacyId: z.string().nullish(),
	name: z.string(),
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/gm),
	deleted: z.boolean(),
	published: z.boolean(),
	outsideApiId: z.string().cuid().nullish(),
	apiIdentifier: z.string().nullish(),
	sourceId: z.string().cuid(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteOrganization extends z.infer<typeof _OrganizationModel> {
	description: CompleteOrgDescription[]
	email: CompleteOrgEmail[]
	location: CompleteOrgLocation[]
	notes: CompleteInternalNote[]
	phone: CompleteOrgPhone[]
	photos: CompleteOrgPhoto[]
	services: CompleteOrgService[]
	orgSocialMedia: CompleteOrgSocialMedia[]
	userList: CompleteUserSavedList[]
	reviews: CompleteOrgReview[]
	associatedUsers: CompleteUser[]
	allowedEditors: CompletePermissionAsset[]
	outsideApi?: CompleteOutsideAPI | null
	source: CompleteSource
	createdBy: CompleteUser
	updatedBy: CompleteUser
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
		notes: InternalNoteModel.array(),
		phone: OrgPhoneModel.array(),
		photos: OrgPhotoModel.array(),
		services: OrgServiceModel.array(),
		orgSocialMedia: OrgSocialMediaModel.array(),
		userList: UserSavedListModel.array(),
		reviews: OrgReviewModel.array(),
		associatedUsers: UserModel.array(),
		allowedEditors: PermissionAssetModel.array(),
		outsideApi: OutsideAPIModel.nullish(),
		source: SourceModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
