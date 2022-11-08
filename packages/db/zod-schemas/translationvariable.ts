import { VariableType } from '@prisma/client'
import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteTranslationKey,
	CompleteUser,
	InternalNoteModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _TranslationVariableModel = z.object({
	id: imports.cuid,
	name: z.string(),
	description: z.string(),
	type: z.nativeEnum(VariableType),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteTranslationVariable extends z.infer<typeof _TranslationVariableModel> {
	keys: CompleteTranslationKey[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * TranslationVariableModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationVariableModel: z.ZodSchema<CompleteTranslationVariable> = z.lazy(() =>
	_TranslationVariableModel.extend({
		keys: TranslationKeyModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
