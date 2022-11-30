import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrganization,
	InternalNoteModel,
	OrgLocationModel,
	OrganizationModel,
} from './index'

export const _OutsideAPIModel = z.object({
	id: imports.cuid,
	name: z.string(),
	description: z.string(),
	urlPattern: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteOutsideAPI extends z.infer<typeof _OutsideAPIModel> {
	Organization: CompleteOrganization[]
	OrgLocation: CompleteOrgLocation[]
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
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
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
