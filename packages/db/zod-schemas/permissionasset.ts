import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteOrgLocation,
	CompleteOrganization,
	CompletePermissionItem,
	CompleteUser,
	OrgLocationModel,
	OrganizationModel,
	PermissionItemModel,
	UserModel,
} from './index'

export const _PermissionAssetModel = z.object({
	id: z.string(),
	userId: z.string(),
	permissionId: z.string(),
})

export interface CompletePermissionAsset extends z.infer<typeof _PermissionAssetModel> {
	user: CompleteUser
	permission: CompletePermissionItem
	organization: CompleteOrganization[]
	location: CompleteOrgLocation[]
}

/**
 * PermissionAssetModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PermissionAssetModel: z.ZodSchema<CompletePermissionAsset> = z.lazy(() =>
	_PermissionAssetModel.extend({
		user: UserModel,
		permission: PermissionItemModel,
		organization: OrganizationModel.array(),
		location: OrgLocationModel.array(),
	})
)
