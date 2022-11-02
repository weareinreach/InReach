import * as z from 'zod'

import * as imports from '../zod-util'
import {
	CompleteOrganization,
	CompletePhoneType,
	CompleteUser,
	OrganizationModel,
	PhoneTypeModel,
	UserModel,
} from './index'

export const _OrgPhoneModel = z.object({
	id: z.string(),
	number: z.string(),
	published: z.boolean(),
	primary: z.boolean(),
	phoneTypeId: z.string(),
	organizationId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgPhone extends z.infer<typeof _OrgPhoneModel> {
	phoneType: CompletePhoneType
	organization: CompleteOrganization
	createdBy: CompleteUser
	updatedBy: CompleteUser
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
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
