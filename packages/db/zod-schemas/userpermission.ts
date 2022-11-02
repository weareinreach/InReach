import * as z from 'zod'

import { CompleteUser, CompleteUserRole, UserModel, UserRoleModel } from './index'

export const _UserPermissionModel = z.object({
	id: z.string(),
	name: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteUserPermission extends z.infer<typeof _UserPermissionModel> {
	users: CompleteUser[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	UserRole: CompleteUserRole[]
}

/**
 * UserPermissionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserPermissionModel: z.ZodSchema<CompleteUserPermission> = z.lazy(() =>
	_UserPermissionModel.extend({
		users: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		UserRole: UserRoleModel.array(),
	})
)
