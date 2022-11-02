import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteOrganization, CompleteUser, OrganizationModel, UserModel } from './index'

export const _OrgNotesModel = z.object({
	id: z.string(),
	text: z.string(),
	orgId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgNotes extends z.infer<typeof _OrgNotesModel> {
	organization: CompleteOrganization
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgNotesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgNotesModel: z.ZodSchema<CompleteOrgNotes> = z.lazy(() =>
	_OrgNotesModel.extend({
		organization: OrganizationModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
