import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrgService,
	CompleteUser,
	InternalNoteModel,
	OrgLocationModel,
	OrgServiceModel,
	UserModel,
} from './index'

export const _OrgHoursModel = z.object({
	id: imports.cuid,
	dayIndex: z.number().int(),
	start: z.date(),
	end: z.date(),
	orgLocId: imports.cuid.nullish(),
	orgServiceId: imports.cuid.nullish(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteOrgHours extends z.infer<typeof _OrgHoursModel> {
	orgLocation?: CompleteOrgLocation | null
	orgService?: CompleteOrgService | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * OrgHoursModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgHoursModel: z.ZodSchema<CompleteOrgHours> = z.lazy(() =>
	_OrgHoursModel.extend({
		orgLocation: OrgLocationModel.nullish(),
		orgService: OrgServiceModel.nullish(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
