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

export const _OrgPhotoModel = z.object({
	id: imports.cuid,
	src: z.string(),
	height: z.number().int().nullish(),
	width: z.number().int().nullish(),
	published: z.boolean(),
	orgId: imports.cuid.nullish(),
	orgLocationId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteOrgPhoto extends z.infer<typeof _OrgPhotoModel> {
	organization?: CompleteOrganization | null
	orgLocation?: CompleteOrgLocation | null
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
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
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
