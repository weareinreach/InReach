import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrganization,
	CompleteSocialMediaService,
	InternalNoteModel,
	OrgLocationModel,
	OrganizationModel,
	SocialMediaServiceModel,
} from './index'

export const _OrgSocialMediaModel = z.object({
	id: imports.cuid,
	username: z.string(),
	url: z.string(),
	serviceId: imports.cuid,
	organizationId: imports.cuid,
	orgLocationId: z.string().nullish(),
	/** Associated only with location and not overall organization (for large orgs w/ multiple locations) */
	orgLocationOnly: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteOrgSocialMedia extends z.infer<typeof _OrgSocialMediaModel> {
	service: CompleteSocialMediaService
	organization: CompleteOrganization
	orgLocation?: CompleteOrgLocation | null
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * OrgSocialMediaModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgSocialMediaModel: z.ZodSchema<CompleteOrgSocialMedia> = z.lazy(() =>
	_OrgSocialMediaModel.extend({
		service: SocialMediaServiceModel,
		organization: OrganizationModel,
		orgLocation: OrgLocationModel.nullish(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
