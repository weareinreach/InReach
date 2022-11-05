import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteCountry,
	CompleteGovDist,
	CompleteInternalNote,
	CompleteLanguage,
	CompleteOrganization,
	CompleteServiceTag,
	CompleteUser,
	CountryModel,
	GovDistModel,
	InternalNoteModel,
	LanguageModel,
	OrganizationModel,
	ServiceTagModel,
	UserModel,
} from './index'

export const _OrgReviewModel = z.object({
	id: z.string().cuid(),
	rating: z.number().int(),
	comment: z.string().nullish(),
	visible: z.boolean(),
	organizationId: z.string().cuid(),
	serviceId: z.string().cuid().nullish(),
	langId: z.string().cuid().nullish(),
	lcrCity: z.string().nullish(),
	lcrGovDistId: z.string().cuid().nullish(),
	lcrCountryId: z.string().cuid().nullish(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteOrgReview extends z.infer<typeof _OrgReviewModel> {
	organization: CompleteOrganization
	service?: CompleteServiceTag | null
	language?: CompleteLanguage | null
	lcrGovDist?: CompleteGovDist | null
	lcrCountry?: CompleteCountry | null
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * OrgReviewModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgReviewModel: z.ZodSchema<CompleteOrgReview> = z.lazy(() =>
	_OrgReviewModel.extend({
		organization: OrganizationModel,
		service: ServiceTagModel.nullish(),
		language: LanguageModel.nullish(),
		lcrGovDist: GovDistModel.nullish(),
		lcrCountry: CountryModel.nullish(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
