import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompletePermissionItem,
	CompleteUser,
	PermissionItemModel,
	UserModel,
} from './index'

export const _UserRoleModel = z.object({
	id: imports.cuid,
	name: z.string(),
	tag: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUserRole extends z.infer<typeof _UserRoleModel> {
	permissions: CompletePermissionItem[]
	user: CompleteUser[]
	auditLog: CompleteAuditLog[]
}

/**
 * UserRoleModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserRoleModel: z.ZodSchema<CompleteUserRole> = z.lazy(() =>
	_UserRoleModel.extend({
		permissions: PermissionItemModel.array(),
		user: UserModel.array(),
		auditLog: AuditLogModel.array(),
	})
)
