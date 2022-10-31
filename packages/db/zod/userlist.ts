import { UserListVisibility } from '@prisma/client'
import * as z from 'zod'

import { CompleteOrganization, CompleteUser, OrganizationModel, UserModel } from './index'

export const _UserListModel = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	name: z.string(),
	visibility: z.nativeEnum(UserListVisibility),
	ownedById: z.string(),
})

export interface CompleteUserList extends z.infer<typeof _UserListModel> {
	organizations: CompleteOrganization[]
	ownedBy: CompleteUser
	sharedWith: CompleteUser[]
}

/**
 * UserListModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserListModel: z.ZodSchema<CompleteUserList> = z.lazy(() =>
	_UserListModel.extend({
		organizations: OrganizationModel.array(),
		ownedBy: UserModel,
		sharedWith: UserModel.array(),
	})
)
