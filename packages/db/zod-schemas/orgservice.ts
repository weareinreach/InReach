import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	AttributeSupplementModel,
	AuditLogModel,
	CompleteAttribute,
	CompleteAttributeSupplement,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrgHours,
	CompleteOrgLocation,
	CompleteOrgReview,
	CompleteOrganization,
	CompleteServiceTag,
	CompleteTranslationKey,
	InternalNoteModel,
	OrgHoursModel,
	OrgLocationModel,
	OrgReviewModel,
	OrganizationModel,
	ServiceTagModel,
	TranslationKeyModel,
} from './index'

export const _OrgServiceModel = z.object({
	id: imports.cuid,
	published: z.boolean(),
	serviceId: imports.cuid,
	organizationId: imports.cuid.nullish(),
	orgLocationId: imports.cuid.nullish(),
	accessKeyId: imports.cuid.nullish(),
	descKeyId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteOrgService extends z.infer<typeof _OrgServiceModel> {
	service: CompleteServiceTag
	hours: CompleteOrgHours[]
	orgReview: CompleteOrgReview[]
	attributes: CompleteAttribute[]
	attributeSupplement: CompleteAttributeSupplement[]
	organization?: CompleteOrganization | null
	orgLocation?: CompleteOrgLocation | null
	accessKey?: CompleteTranslationKey | null
	descKey?: CompleteTranslationKey | null
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * OrgServiceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgServiceModel: z.ZodSchema<CompleteOrgService> = z.lazy(() =>
	_OrgServiceModel.extend({
		service: ServiceTagModel,
		hours: OrgHoursModel.array(),
		orgReview: OrgReviewModel.array(),
		attributes: AttributeModel.array(),
		attributeSupplement: AttributeSupplementModel.array(),
		organization: OrganizationModel.nullish(),
		orgLocation: OrgLocationModel.nullish(),
		accessKey: TranslationKeyModel.nullish(),
		descKey: TranslationKeyModel.nullish(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
