import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AttributeModel,
	AttributeSupplementModel,
	CompleteAttribute,
	CompleteAttributeSupplement,
	CompleteInternalNote,
	CompleteLanguage,
	CompleteOrgHours,
	CompleteOrganization,
	CompleteServiceTag,
	CompleteUser,
	InternalNoteModel,
	LanguageModel,
	OrgHoursModel,
	OrganizationModel,
	ServiceTagModel,
	UserModel,
} from './index'

export const _OrgServiceModel = z.object({
	id: imports.cuid,
	published: z.boolean(),
	accessInstructions: z.string().nullish(),
	description: z.string().nullish(),
	organizationId: imports.cuid,
	langId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteOrgService extends z.infer<typeof _OrgServiceModel> {
	hours: CompleteOrgHours[]
	service: CompleteServiceTag[]
	attributes: CompleteAttribute[]
	attributeSupplement: CompleteAttributeSupplement[]
	organization: CompleteOrganization
	language: CompleteLanguage
	createdBy: CompleteUser
	updatedBy: CompleteUser
	internalNote: CompleteInternalNote[]
}

/**
 * OrgServiceModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgServiceModel: z.ZodSchema<CompleteOrgService> = z.lazy(() =>
	_OrgServiceModel.extend({
		hours: OrgHoursModel.array(),
		service: ServiceTagModel.array(),
		attributes: AttributeModel.array(),
		attributeSupplement: AttributeSupplementModel.array(),
		organization: OrganizationModel,
		language: LanguageModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		internalNote: InternalNoteModel.array(),
	})
)
