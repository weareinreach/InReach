import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteTranslation, CompleteUser, TranslationModel, UserModel } from './index'

export const _TranslationVariableModel = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	plural: z.boolean(),
	ordinal: z.boolean(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteTranslationVariable extends z.infer<typeof _TranslationVariableModel> {
	translation: CompleteTranslation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * TranslationVariableModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const TranslationVariableModel: z.ZodSchema<CompleteTranslationVariable> = z.lazy(() =>
	_TranslationVariableModel.extend({
		translation: TranslationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
