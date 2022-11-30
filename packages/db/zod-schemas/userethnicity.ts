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

export const _UserEthnicityModel = z.object({
	id: imports.cuid,
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	ethnicity: z.string(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUserEthnicity extends z.infer<typeof _UserEthnicityModel> {
	users: CompleteUser[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
}

/**
 * UserEthnicityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserEthnicityModel: z.ZodSchema<CompleteUserEthnicity> = z.lazy(() =>
	_UserEthnicityModel.extend({
		users: UserModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
	})
)
