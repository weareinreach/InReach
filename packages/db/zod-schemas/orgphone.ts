import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AuditLogModel,
	CompleteAuditLog,
	CompleteCountry,
	CompleteInternalNote,
	CompleteOrgLocation,
	CompleteOrganization,
	CompletePhoneType,
	CompleteUser,
	CountryModel,
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
	countryId: imports.cuid,
	phoneTypeId: imports.cuid,
	organizationId: imports.cuid,
	userId: imports.cuid.nullish(),
	orgLocationId: imports.cuid.nullish(),
	/** Associated only with location and not overall organization (for large orgs w/ multiple locations) */
	orgLocationOnly: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteOrgPhone extends z.infer<typeof _OrgPhoneModel> {
	country: CompleteCountry
	phoneType: CompletePhoneType
	organization: CompleteOrganization
	user?: CompleteUser | null
	orgLocation?: CompleteOrgLocation | null
	auditLog: CompleteAuditLog[]
	internalNote: CompleteInternalNote[]
}

/**
 * OrgPhoneModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgPhoneModel: z.ZodSchema<CompleteOrgPhone> = z.lazy(() =>
	_OrgPhoneModel.extend({
		/** Country profiles have intl dial prefix */
		country: CountryModel,
		phoneType: PhoneTypeModel,
		organization: OrganizationModel,
		user: UserModel.nullish(),
		orgLocation: OrgLocationModel.nullish(),
		auditLog: AuditLogModel.array(),
		internalNote: InternalNoteModel.array(),
	})
)
