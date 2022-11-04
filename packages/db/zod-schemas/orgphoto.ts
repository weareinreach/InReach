import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteOrganization, CompleteUser, OrganizationModel, UserModel } from './index'

export const _OrgPhotoModel = z.object({
	id: z.string(),
	src: z.string(),
	height: z.number().int().nullish(),
	width: z.number().int().nullish(),
	published: z.boolean(),
	orgId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgPhoto extends z.infer<typeof _OrgPhotoModel> {
	organization: CompleteOrganization
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgPhotoModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgPhotoModel: z.ZodSchema<CompleteOrgPhoto> = z.lazy(() =>
	_OrgPhotoModel.extend({
		organization: OrganizationModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
