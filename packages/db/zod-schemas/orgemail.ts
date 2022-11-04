import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteOrgLocation,
	CompleteOrganization,
	CompleteUser,
	CompleteUserTitle,
	OrgLocationModel,
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
	orgLocationOnly: z.boolean(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgEmail extends z.infer<typeof _OrgEmailModel> {
	title: CompleteUserTitle
	organization: CompleteOrganization
	orgLocation: CompleteOrgLocation[]
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
		orgLocation: OrgLocationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
