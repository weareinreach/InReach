import * as z from 'zod'

import { CompleteUser, UserModel } from './index'

export const _OrgReviewModel = z.object({
	id: z.string(),
	rating: z.number().int(),
	comment: z.string().nullish(),
	visible: z.boolean(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgReview extends z.infer<typeof _OrgReviewModel> {
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgReviewModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgReviewModel: z.ZodSchema<CompleteOrgReview> = z.lazy(() =>
	_OrgReviewModel.extend({
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
