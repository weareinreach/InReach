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

export const _OrgPhotoModel = z.object({
	id: z.string().cuid(),
	src: z.string(),
	height: z.number().int().nullish(),
	width: z.number().int().nullish(),
	published: z.boolean(),
	orgId: z.string().cuid().nullish(),
	orgLocationId: z.string().cuid().nullish(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteOrgPhoto extends z.infer<typeof _OrgPhotoModel> {
	organization?: CompleteOrganization | null
	orgLocation?: CompleteOrgLocation | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * OrgPhotoModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgPhotoModel: z.ZodSchema<CompleteOrgPhoto> = z.lazy(() =>
	_OrgPhotoModel.extend({
		organization: OrganizationModel.nullish(),
		orgLocation: OrgLocationModel.nullish(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
