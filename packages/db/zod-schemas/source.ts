import { SourceType } from '@prisma/client'
import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrganization,
	CompleteUser,
	InternalNoteModel,
	OrganizationModel,
	UserModel,
} from './index'

export const _SourceModel = z.object({
	id: imports.cuid,
	source: z.string(),
	type: z.nativeEnum(SourceType),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteSource extends z.infer<typeof _SourceModel> {
	organization: CompleteOrganization[]
	user: CompleteUser[]
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
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
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
