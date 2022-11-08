import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrganization,
	CompletePhoneType,
	CompleteUser,
	InternalNoteModel,
	OrgLocationModel,
	OrganizationModel,
	PhoneTypeModel,
	UserModel,
} from './index'

export const _OrgPhoneModel = z.object({
	id: imports.cuid,
	number: z.string(),
	published: z.boolean(),
	primary: z.boolean(),
	phoneTypeId: imports.cuid,
	organizationId: imports.cuid,
	userId: imports.cuid.nullish(),
	/** Associated only with location and not overall organization (for large orgs w/ multiple locations) */
	orgLocationOnly: z.boolean(),
	createdAt: z.date(),
	createdById: imports.cuid,
	updatedAt: z.date(),
	updatedById: imports.cuid,
})

export interface CompleteOrgPhone extends z.infer<typeof _OrgPhoneModel> {
	phoneType: CompletePhoneType
	organization: CompleteOrganization
	user?: CompleteUser | null
	orgLocation: CompleteOrgLocation[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
	InternalNote: CompleteInternalNote[]
}

/**
 * OrgPhoneModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgPhoneModel: z.ZodSchema<CompleteOrgPhone> = z.lazy(() =>
	_OrgPhoneModel.extend({
		phoneType: PhoneTypeModel,
		organization: OrganizationModel,
		user: UserModel.nullish(),
		orgLocation: OrgLocationModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
		InternalNote: InternalNoteModel.array(),
	})
)
