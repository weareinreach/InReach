import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteUser, CompleteUserPermission, UserModel, UserPermissionModel } from './index'

export const _UserRoleModel = z.object({
	id: z.string(),
	name: z.string(),
	createdAt: z.date(),
	createdById: z.string().nullish(),
	updatedAt: z.date(),
	updatedById: z.string().nullish(),
})

export interface CompleteUserRole extends z.infer<typeof _UserRoleModel> {
	permissions: CompleteUserPermission[]
	createdBy?: CompleteUser | null
	updatedBy?: CompleteUser | null
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
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
		User: UserModel.array(),
	})
)
