import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteOrganization, CompleteUser, OrganizationModel, UserModel } from './index'

export const _OrgPhotosModel = z.object({
	id: z.string(),
	foursquareId: z.string().nullish(),
	src: z.string(),
	height: z.number().int().nullish(),
	width: z.number().int().nullish(),
	orgId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgPhotos extends z.infer<typeof _OrgPhotosModel> {
	organization: CompleteOrganization
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgPhotosModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgPhotosModel: z.ZodSchema<CompleteOrgPhotos> = z.lazy(() =>
	_OrgPhotosModel.extend({
		organization: OrganizationModel,
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
