import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteOrgEmail,
	CompleteTranslationKey,
	CompleteUser,
	OrgEmailModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _UserTitleModel = z.object({
	id: imports.cuid,
	title: z.string(),
	searchable: z.boolean(),
	keyId: imports.cuid,
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUserTitle extends z.infer<typeof _UserTitleModel> {
	email: CompleteOrgEmail[]
	orgUser: CompleteUser[]
	key: CompleteTranslationKey
	auditLog: CompleteAuditLog[]
}

/**
 * UserTitleModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserTitleModel: z.ZodSchema<CompleteUserTitle> = z.lazy(() =>
	_UserTitleModel.extend({
		email: OrgEmailModel.array(),
		orgUser: UserModel.array(),
		key: TranslationKeyModel,
		auditLog: AuditLogModel.array(),
	})
)
