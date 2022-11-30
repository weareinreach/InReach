import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteCountry,
	CompleteGovDist,
	CompleteInternalNote,
	CompleteLanguage,
	CompleteOrgService,
	CompleteOrganization,
	CountryModel,
	GovDistModel,
	InternalNoteModel,
	LanguageModel,
	OrgServiceModel,
	OrganizationModel,
} from './index'

export const _OrgReviewModel = z.object({
	id: imports.cuid,
	rating: z.number().int(),
	reviewText: z.string().nullish(),
	visible: z.boolean(),
	organizationId: imports.cuid,
	orgServiceId: imports.cuid.nullish(),
	langId: imports.cuid.nullish(),
	/** How confident is the API guess? */
	langConfidence: z.number().nullish(),
	/** From https://perspectiveapi.com/ */
	toxicity: z.number().nullish(),
	lcrCity: z.string().nullish(),
	lcrGovDistId: imports.cuid.nullish(),
	lcrCountryId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteOrgReview extends z.infer<typeof _OrgReviewModel> {
	organization: CompleteOrganization
	orgService?: CompleteOrgService | null
	language?: CompleteLanguage | null
	lcrGovDist?: CompleteGovDist | null
	lcrCountry?: CompleteCountry | null
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * OrgReviewModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgReviewModel: z.ZodSchema<CompleteOrgReview> = z.lazy(() =>
	_OrgReviewModel.extend({
		organization: OrganizationModel,
		orgService: OrgServiceModel.nullish(),
		language: LanguageModel.nullish(),
		lcrGovDist: GovDistModel.nullish(),
		lcrCountry: CountryModel.nullish(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
