import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteTranslationKey,
	CompleteUser,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _UserTypeModel = z.object({
	id: imports.cuid,
	type: z.string(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUserType extends z.infer<typeof _UserTypeModel> {
	users: CompleteUser[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
}

/**
 * UserTypeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserTypeModel: z.ZodSchema<CompleteUserType> = z.lazy(() =>
	_UserTypeModel.extend({
		users: UserModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
	})
)
