import * as z from 'zod'

import {
	CompleteOrgLocation,
	CompleteOrgService,
	CompleteUser,
	OrgLocationModel,
	OrgServiceModel,
	UserModel,
} from './index'

export const _OrgHoursModel = z.object({
	id: z.string(),
	dayIndex: z.number().int(),
	start: z.number().int(),
	end: z.number().int(),
	orgLocId: z.string().nullish(),
	orgServiceId: z.string().nullish(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgHours extends z.infer<typeof _OrgHoursModel> {
	orgLocation?: CompleteOrgLocation | null
	orgService?: CompleteOrgService | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
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
	})
)
