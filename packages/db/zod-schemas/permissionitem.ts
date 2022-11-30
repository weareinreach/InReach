import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompletePermissionAsset,
	CompleteUser,
	CompleteUserRole,
	PermissionAssetModel,
	UserModel,
	UserRoleModel,
} from './index'

export const _PermissionItemModel = z.object({
	id: imports.cuid,
	name: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompletePermissionItem extends z.infer<typeof _PermissionItemModel> {
	users: CompleteUser[]
	roles: CompleteUserRole[]
	assets: CompletePermissionAsset[]
	auditLog: CompleteAuditLog[]
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
		auditLog: AuditLogModel.array(),
	})
)
