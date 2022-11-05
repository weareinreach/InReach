import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteLanguage,
	CompleteOrganization,
	CompleteUser,
	InternalNoteModel,
	LanguageModel,
	OrganizationModel,
	UserModel,
} from './index'

export const _OrgDescriptionModel = z.object({
	id: z.string().cuid(),
	text: z.string(),
	langId: z.string().cuid(),
	orgId: z.string().cuid(),
	createdAt: z.date(),
	createdById: z.string().cuid(),
	updatedAt: z.date(),
	updatedById: z.string().cuid(),
})

export interface CompleteOrgDescription extends z.infer<typeof _OrgDescriptionModel> {
	language: CompleteLanguage
	organization: CompleteOrganization
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * OrgDescriptionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgDescriptionModel: z.ZodSchema<CompleteOrgDescription> = z.lazy(() =>
	_OrgDescriptionModel.extend({
		language: LanguageModel,
		organization: OrganizationModel,
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
