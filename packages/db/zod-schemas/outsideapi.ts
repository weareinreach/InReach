import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteOrgLocation,
	CompleteOrganization,
	CompleteUser,
	OrgLocationModel,
	OrganizationModel,
	UserModel,
} from './index'

export const _OutsideAPIModel = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	urlPattern: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOutsideAPI extends z.infer<typeof _OutsideAPIModel> {
	createdBy: CompleteUser
	updatedBy: CompleteUser
	Organization: CompleteOrganization[]
	OrgLocation: CompleteOrgLocation[]
}

/**
 * OutsideAPIModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OutsideAPIModel: z.ZodSchema<CompleteOutsideAPI> = z.lazy(() =>
	_OutsideAPIModel.extend({
		createdBy: UserModel,
		updatedBy: UserModel,
		Organization: OrganizationModel.array(),
		OrgLocation: OrgLocationModel.array(),
	})
)
