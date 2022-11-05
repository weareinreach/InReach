import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrganization,
	CompleteUser,
	CompleteUserTitle,
	InternalNoteModel,
	OrgLocationModel,
	OrganizationModel,
	UserModel,
	UserTitleModel,
} from './index'

export const _OrgEmailModel = z.object({
	id: z.string().cuid(),
	firstName: z.string(),
	lastName: z.string(),
	primary: z.boolean(),
	email: z.string(),
	published: z.boolean(),
	titleId: z.string().cuid(),
	orgId: z.string().cuid(),
	userId: z.string().cuid().nullish(),
	/** Associated only with location and not overall organization (for large orgs w/ multiple locations) */
	orgLocationOnly: z.boolean(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteOrgEmail extends z.infer<typeof _OrgEmailModel> {
	title: CompleteUserTitle
	organization: CompleteOrganization
	user?: CompleteUser | null
	orgLocation: CompleteOrgLocation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
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
		user: UserModel.nullish(),
		orgLocation: OrgLocationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
