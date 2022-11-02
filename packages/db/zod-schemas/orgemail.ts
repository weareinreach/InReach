import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteOrganization,
	CompleteUser,
	CompleteUserTitle,
	OrganizationModel,
	UserModel,
	UserTitleModel,
} from './index'

export const _OrgEmailModel = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	primary: z.boolean(),
	email: z.string(),
	published: z.boolean(),
	titleId: z.string(),
	orgId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgEmail extends z.infer<typeof _OrgEmailModel> {
	title: CompleteUserTitle
	organization: CompleteOrganization
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgEmailModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgEmailModel: z.ZodSchema<CompleteOrgEmail> = z.lazy(() =>
	_OrgEmailModel.extend({
		title: UserTitleModel,
		organization: OrganizationModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
