import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteInternalNote, CompleteUser, InternalNoteModel, UserModel } from './index'

export const _NavigationModel = z.object({
	id: imports.cuid,
	display: z.string(),
	href: z.string().nullish(),
	isParent: z.boolean(),
	icon: z.string().nullish(),
	parentId: imports.cuid.nullish(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteNavigation extends z.infer<typeof _NavigationModel> {
	parentItem?: CompleteNavigation | null
	children: CompleteNavigation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * NavigationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const NavigationModel: z.ZodSchema<CompleteNavigation> = z.lazy(() =>
	_NavigationModel.extend({
		parentItem: NavigationModel.nullish(),
		children: NavigationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
