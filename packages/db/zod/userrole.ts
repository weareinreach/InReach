import * as z from 'zod'

import { CompleteUser, CompleteUserPermission, UserModel, UserPermissionModel } from './index'

export const _UserRoleModel = z.object({
	id: z.string(),
	name: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteUserRole extends z.infer<typeof _UserRoleModel> {
	permissions: CompleteUserPermission[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	User: CompleteUser[]
}

/**
 * UserRoleModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserRoleModel: z.ZodSchema<CompleteUserRole> = z.lazy(() =>
	_UserRoleModel.extend({
		permissions: UserPermissionModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		User: UserModel.array(),
	})
)
