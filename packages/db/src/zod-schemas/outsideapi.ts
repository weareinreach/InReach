import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrganization,
	CompleteUser,
	InternalNoteModel,
	OrgLocationModel,
	OrganizationModel,
	UserModel,
} from './index'

export const _OutsideAPIModel = z.object({
	id: imports.cuid,
	name: z.string(),
	description: z.string(),
	urlPattern: z.string(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteOutsideAPI extends z.infer<typeof _OutsideAPIModel> {
	Organization: CompleteOrganization[]
	OrgLocation: CompleteOrgLocation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * OutsideAPIModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OutsideAPIModel: z.ZodSchema<CompleteOutsideAPI> = z.lazy(() =>
	_OutsideAPIModel.extend({
		Organization: OrganizationModel.array(),
		OrgLocation: OrgLocationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
