import * as z from 'zod'

import * as imports from '../zod-util'
import { AuditLogModel, CompleteAuditLog, CompleteUser, UserModel } from './index'

export const _UserMailModel = z.object({
	id: imports.cuid,
	toUserId: imports.cuid,
	/** Array of email addresses */
	toExternal: z.string().array(),
	read: z.boolean(),
	subject: z.string(),
	body: z.string(),
	from: z.string().nullish(),
	fromUserId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
	responseToId: z.string().nullish(),
})

export interface CompleteUserMail extends z.infer<typeof _UserMailModel> {
	toUser: CompleteUser
	fromUser?: CompleteUser | null
	replies: CompleteUserMail[]
	auditLog: CompleteAuditLog[]
	responseTo?: CompleteUserMail | null
}

/**
 * UserMailModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserMailModel: z.ZodSchema<CompleteUserMail> = z.lazy(() =>
	_UserMailModel.extend({
		toUser: UserModel,
		fromUser: UserModel.nullish(),
		replies: UserMailModel.array(),
		auditLog: AuditLogModel.array(),
		responseTo: UserMailModel.nullish(),
	})
)
