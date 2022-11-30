import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteTranslationKey,
	InternalNoteModel,
	TranslationKeyModel,
} from './index'

export const _NavigationModel = z.object({
	id: imports.cuid,
	display: z.string(),
	href: z.string().nullish(),
	isParent: z.boolean(),
	icon: z.string().nullish(),
	keyId: imports.cuid,
	parentId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteNavigation extends z.infer<typeof _NavigationModel> {
	key: CompleteTranslationKey
	parentItem?: CompleteNavigation | null
	children: CompleteNavigation[]
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * NavigationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const NavigationModel: z.ZodSchema<CompleteNavigation> = z.lazy(() =>
	_NavigationModel.extend({
		key: TranslationKeyModel,
		parentItem: NavigationModel.nullish(),
		children: NavigationModel.array(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
