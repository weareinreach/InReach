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

export const _UserImmigrationModel = z.object({
	id: imports.cuid,
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	status: z.string(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUserImmigration extends z.infer<typeof _UserImmigrationModel> {
	users: CompleteUser[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
}

/**
 * UserImmigrationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserImmigrationModel: z.ZodSchema<CompleteUserImmigration> = z.lazy(() =>
	_UserImmigrationModel.extend({
		users: UserModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
	})
)
