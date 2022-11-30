import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrgService,
	InternalNoteModel,
	OrgLocationModel,
	OrgServiceModel,
} from './index'

export const _OrgHoursModel = z.object({
	id: imports.cuid,
	/** Sun 0, Mon 1, Tue 2, Wed 3, Thu 3, Fri 4, Sat 6 */
	dayIndex: z.number().int(),
	start: z.date(),
	end: z.date(),
	orgLocId: imports.cuid.nullish(),
	orgServiceId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteOrgHours extends z.infer<typeof _OrgHoursModel> {
	orgLocation?: CompleteOrgLocation | null
	orgService?: CompleteOrgService | null
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
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
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
