import { SourceType } from '@prisma/client'
import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteOrganization, CompleteUser, OrganizationModel, UserModel } from './index'

export const _SourceModel = z.object({
	id: z.string().cuid(),
	source: z.string(),
	type: z.nativeEnum(SourceType),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteSource extends z.infer<typeof _SourceModel> {
	organization: CompleteOrganization[]
	user: CompleteUser[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * SourceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SourceModel: z.ZodSchema<CompleteSource> = z.lazy(() =>
	_SourceModel.extend({
		organization: OrganizationModel.array(),
		user: UserModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
