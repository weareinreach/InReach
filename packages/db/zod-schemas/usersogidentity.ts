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

export const _UserSOGIdentityModel = z.object({
	id: imports.cuid,
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	identifyAs: z.string(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUserSOGIdentity extends z.infer<typeof _UserSOGIdentityModel> {
	users: CompleteUser[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
}

/**
 * UserSOGIdentityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserSOGIdentityModel: z.ZodSchema<CompleteUserSOGIdentity> = z.lazy(() =>
	_UserSOGIdentityModel.extend({
		users: UserModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
	})
)
