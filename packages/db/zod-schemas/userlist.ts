import { UserListVisibility } from '@prisma/client'
import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteOrganization, CompleteUser, OrganizationModel, UserModel } from './index'

export const _UserListModel = z.object({
	id: z.string(),
	name: z.string(),
	visibility: z.nativeEnum(UserListVisibility),
	ownedById: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUserList extends z.infer<typeof _UserListModel> {
	organizations: CompleteOrganization[]
	sharedWith: CompleteUser[]
	ownedBy: CompleteUser
}

/**
 * UserListModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserListModel: z.ZodSchema<CompleteUserList> = z.lazy(() =>
	_UserListModel.extend({
		organizations: OrganizationModel.array(),
		sharedWith: UserModel.array(),
		ownedBy: UserModel,
	})
)
