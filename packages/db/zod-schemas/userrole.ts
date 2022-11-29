import * as z from 'zod'

import * as imports from '../zod-util'
import { CompletePermissionItem, CompleteUser, PermissionItemModel, UserModel } from './index'

export const _UserRoleModel = z.object({
	id: imports.cuid,
	name: z.string(),
	tag: z.string(),
	createdAt: z.date(),
	createdById: imports.cuid.nullish(),
	updatedAt: z.date(),
	updatedById: imports.cuid.nullish(),
})

export interface CompleteUserRole extends z.infer<typeof _UserRoleModel> {
	permissions: CompletePermissionItem[]
	user: CompleteUser[]
	createdBy?: CompleteUser | null
	updatedBy?: CompleteUser | null
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
		createdBy: UserModel.nullish(),
		updatedBy: UserModel.nullish(),
	})
)
