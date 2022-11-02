import * as z from 'zod'

import { CompleteOrganization, CompleteUser, OrganizationModel, UserModel } from './index'

export const _OrgSourceModel = z.object({
	id: z.string(),
	source: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgSource extends z.infer<typeof _OrgSourceModel> {
	organization: CompleteOrganization[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgSourceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgSourceModel: z.ZodSchema<CompleteOrgSource> = z.lazy(() =>
	_OrgSourceModel.extend({
		organization: OrganizationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
