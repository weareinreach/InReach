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
	id: imports.cuid,
	text: z.string(),
	langId: imports.cuid,
	orgId: imports.cuid,
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteOrgDescription extends z.infer<typeof _OrgDescriptionModel> {
	language: CompleteLanguage
	organization: CompleteOrganization
	createdBy: CompleteUser
	updatedBy: CompleteUser
	internalNote: CompleteInternalNote[]
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
		internalNote: InternalNoteModel.array(),
	})
)
