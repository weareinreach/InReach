import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteOrganization,
	CompleteServiceType,
	CompleteUser,
	OrganizationModel,
	ServiceTypeModel,
	UserModel,
} from './index'

export const _OrgReviewModel = z.object({
	id: z.string(),
	rating: z.number().int(),
	comment: z.string().nullish(),
	visible: z.boolean(),
	organizationId: z.string(),
	serviceId: z.string().nullish(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgReview extends z.infer<typeof _OrgReviewModel> {
	organization: CompleteOrganization
	service?: CompleteServiceType | null
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
		organization: OrganizationModel,
		service: ServiceTypeModel.nullish(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
