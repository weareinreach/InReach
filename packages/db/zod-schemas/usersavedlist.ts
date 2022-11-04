import { UserSavedListVisibility } from '@prisma/client'
import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteOrganization, CompleteUser, OrganizationModel, UserModel } from './index'

export const _UserSavedListModel = z.object({
	id: z.string(),
	name: z.string(),
	visibility: z.nativeEnum(UserSavedListVisibility),
	ownedById: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUserSavedList extends z.infer<typeof _UserSavedListModel> {
	organizations: CompleteOrganization[]
	sharedWith: CompleteUser[]
	ownedBy: CompleteUser
}

/**
 * UserSavedListModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserSavedListModel: z.ZodSchema<CompleteUserSavedList> = z.lazy(() =>
	_UserSavedListModel.extend({
		organizations: OrganizationModel.array(),
		sharedWith: UserModel.array(),
		ownedBy: UserModel,
	})
)
