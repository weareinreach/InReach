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

export const _UserCommunityModel = z.object({
	id: imports.cuid,
	/** Use shorthand descriptions - front-end displayable text is defined in Translations */
	community: z.string(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUserCommunity extends z.infer<typeof _UserCommunityModel> {
	users: CompleteUser[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
}

/**
 * UserCommunityModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserCommunityModel: z.ZodSchema<CompleteUserCommunity> = z.lazy(() =>
	_UserCommunityModel.extend({
		users: UserModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
	})
)
