import {
	AttributeSupplement,
	FreeText,
	OrgEmail,
	OrgHours,
	OrgLocation,
	OrgLocationService,
	OrgPhone,
	OrgPhoto,
	OrgService,
	OrgServiceEmail,
	OrgServicePhone,
	OrgServiceTag,
	OrgSocialMedia,
	OrgWebsite,
	OrgWebsiteLanguage,
	OrganizationAttribute,
	OrganizationPermission,
	OutsideAPI,
	Prisma,
	PrismaPromise,
	ServiceAccess,
	ServiceAccessAttribute,
	ServiceArea,
	ServiceAreaCountry,
	ServiceAreaDist,
	ServiceAttribute,
	TranslationKey,
	UserPermission,
	UserToOrganization,
} from '@db/client'
import { BatchNames } from '@db/seed/migrate-v1/org/outData'
import { ZodFindMany, ZodInputs } from '@db/seed/migrate-v1/org/zod'

const clientopt = { skipDuplicates: true }

export const migrateClient: MigrationClient = {
	translationKey: (client, data) => client.translationKey.createMany({ data, ...clientopt }),
	freeText: (client, data) => client.freeText.createMany({ data, ...clientopt }),
	orgLocation: (client, data) => client.orgLocation.createMany({ data, ...clientopt }),
	orgPhone: (client, data) => client.orgPhone.createMany({ data, ...clientopt }),
	orgEmail: (client, data) => client.orgEmail.createMany({ data, ...clientopt }),
	orgWebsite: (client, data) => client.orgWebsite.createMany({ data, ...clientopt }),
	orgWebsiteLanguage: (client, data) => client.orgWebsiteLanguage.createMany({ data, ...clientopt }),
	orgSocialMedia: (client, data) => client.orgSocialMedia.createMany({ data, ...clientopt }),
	outsideAPI: (client, data) => client.outsideAPI.createMany({ data, ...clientopt }),
	orgPhoto: (client, data) => client.orgPhoto.createMany({ data, ...clientopt }),
	orgHours: (client, data) => client.orgHours.createMany({ data, ...clientopt }),
	orgService: (client, data) => client.orgService.createMany({ data, ...clientopt }),
	serviceAccess: (client, data) => client.serviceAccess.createMany({ data, ...clientopt }),
	attributeSupplement: (client, data) => client.attributeSupplement.createMany({ data, ...clientopt }),
	orgServicePhone: (client, data) => client.orgServicePhone.createMany({ data, ...clientopt }),
	orgServiceEmail: (client, data) => client.orgServiceEmail.createMany({ data, ...clientopt }),
	orgLocationService: (client, data) => client.orgLocationService.createMany({ data, ...clientopt }),
	orgServiceTag: (client, data) => client.orgServiceTag.createMany({ data, ...clientopt }),
	organizationAttribute: (client, data) => client.organizationAttribute.createMany({ data, ...clientopt }),
	serviceAttribute: (client, data) => client.serviceAttribute.createMany({ data, ...clientopt }),
	serviceAccessAttribute: (client, data) => client.serviceAccessAttribute.createMany({ data, ...clientopt }),
	serviceArea: (client, data) => client.serviceArea.createMany({ data, ...clientopt }),
	serviceAreaCountry: (client, data) => client.serviceAreaCountry.createMany({ data, ...clientopt }),
	serviceAreaDist: (client, data) => client.serviceAreaDist.createMany({ data, ...clientopt }),
	userToOrganization: (client, data) => client.userToOrganization.createMany({ data, ...clientopt }),
	userPermission: (client, data) => client.userPermission.createMany({ data, ...clientopt }),
	organizationPermission: (client, data) => client.organizationPermission.createMany({ data, ...clientopt }),
}

export const queryClient: QueryClient = {
	translationKey: (client, args) => client.translationKey.findMany(args),
	freeText: (client, args) => client.freeText.findMany(args),
	orgLocation: (client, args) => client.orgLocation.findMany(args),
	orgPhone: (client, args) => client.orgPhone.findMany(args),
	orgEmail: (client, args) => client.orgEmail.findMany(args),
	orgWebsite: (client, args) => client.orgWebsite.findMany(args),
	orgWebsiteLanguage: (client, args) => client.orgWebsiteLanguage.findMany(args),
	orgSocialMedia: (client, args) => client.orgSocialMedia.findMany(args),
	outsideAPI: (client, args) => client.outsideAPI.findMany(args),
	orgPhoto: (client, args) => client.orgPhoto.findMany(args),
	orgHours: (client, args) => client.orgHours.findMany(args),
	orgService: (client, args) => client.orgService.findMany(args),
	serviceAccess: (client, args) => client.serviceAccess.findMany(args),
	attributeSupplement: (client, args) => client.attributeSupplement.findMany(args),
	orgServicePhone: (client, args) => client.orgServicePhone.findMany(args),
	orgServiceEmail: (client, args) => client.orgServiceEmail.findMany(args),
	orgLocationService: (client, args) => client.orgLocationService.findMany(args),
	orgServiceTag: (client, args) => client.orgServiceTag.findMany(args),
	organizationAttribute: (client, args) => client.organizationAttribute.findMany(args),
	serviceAttribute: (client, args) => client.serviceAttribute.findMany(args),
	serviceAccessAttribute: (client, args) => client.serviceAccessAttribute.findMany(args),
	serviceArea: (client, args) => client.serviceArea.findMany(args),
	serviceAreaCountry: (client, args) => client.serviceAreaCountry.findMany(args),
	serviceAreaDist: (client, args) => client.serviceAreaDist.findMany(args),
	userToOrganization: (client, args) => client.userToOrganization.findMany(args),
	userPermission: (client, args) => client.userPermission.findMany(args),
	organizationPermission: (client, args) => client.organizationPermission.findMany(args),
}
export type QueryClient = {
	[K in BatchNames]: (
		client: Prisma.TransactionClient,
		args: ZodFindMany[K]
	) => K extends BatchNames ? PrismaPromise<Partial<PrismaSchemas[K]>[]> : never
}

export type MigrationClient = {
	[K in BatchNames]: (
		client: Prisma.TransactionClient,
		data: ZodInputs[K]
	) => K extends BatchNames ? PrismaPromise<Prisma.BatchPayload> : never
}
type ClientReturn<B extends BatchNames> = (
	client: Prisma.TransactionClient,
	data: ZodInputs[B]
) => PrismaPromise<Prisma.BatchPayload>

type GetClient = <B extends BatchNames>(batchName: B) => ClientReturn<B>

export const getClient: GetClient = (batchName) => {
	return migrateClient[batchName]
}

type PrismaSchemas = {
	translationKey: TranslationKey
	freeText: FreeText
	orgLocation: OrgLocation
	orgPhone: OrgPhone
	orgEmail: OrgEmail
	orgWebsite: OrgWebsite
	orgWebsiteLanguage: OrgWebsiteLanguage
	orgSocialMedia: OrgSocialMedia
	outsideAPI: OutsideAPI
	orgPhoto: OrgPhoto
	orgHours: OrgHours
	orgService: OrgService
	serviceAccess: ServiceAccess
	attributeSupplement: AttributeSupplement
	orgServicePhone: OrgServicePhone
	orgServiceEmail: OrgServiceEmail
	orgLocationService: OrgLocationService
	orgServiceTag: OrgServiceTag
	organizationAttribute: OrganizationAttribute
	serviceAttribute: ServiceAttribute
	serviceAccessAttribute: ServiceAccessAttribute
	serviceArea: ServiceArea
	serviceAreaCountry: ServiceAreaCountry
	serviceAreaDist: ServiceAreaDist
	userToOrganization: UserToOrganization
	userPermission: UserPermission
	organizationPermission: OrganizationPermission
}
