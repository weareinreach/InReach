import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteGovDist,
	CompleteTranslationKey,
	CompleteUser,
	GovDistModel,
	TranslationKeyModel,
	UserModel,
} from './index'

export const _GovDistTypeModel = z.object({
	id: z.string().cuid(),
	name: z.string(),
	translationKeyId: z.string().cuid(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteGovDistType extends z.infer<typeof _GovDistTypeModel> {
	translationKey: CompleteTranslationKey
	createdBy: CompleteUser
	updatedBy: CompleteUser
	GovDist: CompleteGovDist[]
}

/**
 * GovDistTypeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const GovDistTypeModel: z.ZodSchema<CompleteGovDistType> = z.lazy(() =>
	_GovDistTypeModel.extend({
		translationKey: TranslationKeyModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		GovDist: GovDistModel.array(),
	})
)
