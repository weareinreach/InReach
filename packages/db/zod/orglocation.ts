import * as z from 'zod'

import {
	CompleteCountry,
	CompleteGovDist,
	CompleteOrgHours,
	CompleteOrganization,
	CompleteUser,
	CountryModel,
	GovDistModel,
	OrgHoursModel,
	OrganizationModel,
	UserModel,
} from './index'

export const _OrgLocationModel = z.object({
	id: z.string(),
	street1: z.string(),
	street2: z.string(),
	city: z.string(),
	govDistId: z.string().nullish(),
	postCode: z.string().nullish(),
	countryId: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	published: z.boolean(),
	orgId: z.string(),
	createdAt: z.date(),
	createdById: z.string(),
	updatedAt: z.date(),
	updatedById: z.string(),
})

export interface CompleteOrgLocation extends z.infer<typeof _OrgLocationModel> {
	govDist?: CompleteGovDist | null
	country: CompleteCountry
	organization: CompleteOrganization
	hours: CompleteOrgHours[]
	createdBy: CompleteUser
	updatedBy: CompleteUser
}

/**
 * OrgLocationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const OrgLocationModel: z.ZodSchema<CompleteOrgLocation> = z.lazy(() =>
	_OrgLocationModel.extend({
		govDist: GovDistModel.nullish(),
		country: CountryModel,
		organization: OrganizationModel,
		hours: OrgHoursModel.array(),
		createdBy: UserModel,
		updatedBy: UserModel,
	})
)
