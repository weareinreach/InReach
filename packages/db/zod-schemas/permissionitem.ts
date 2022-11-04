import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompletePermissionAsset,
	CompleteUser,
	CompleteUserRole,
	PermissionAssetModel,
	UserModel,
	UserRoleModel,
} from './index'

export const _PermissionItemModel = z.object({
	id: z.string(),
	name: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompletePermissionItem extends z.infer<typeof _PermissionItemModel> {
	users: CompleteUser[]
	roles: CompleteUserRole[]
	assets: CompletePermissionAsset[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * PermissionItemModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PermissionItemModel: z.ZodSchema<CompletePermissionItem> = z.lazy(() =>
	_PermissionItemModel.extend({
		users: UserModel.array(),
		roles: UserRoleModel.array(),
		assets: PermissionAssetModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
