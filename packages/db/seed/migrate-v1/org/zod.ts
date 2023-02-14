import { z } from 'zod'

import { Prisma } from '~db/client'
import { BatchNames } from '~db/seed/migrate-v1/org/outData'
import {
	AttributeSupplementSchema,
	FreeTextSchema,
	OrgEmailSchema,
	OrgHoursSchema,
	OrgLocationSchema,
	OrgLocationServiceSchema,
	OrgPhoneSchema,
	OrgPhotoSchema,
	OrgServiceEmailSchema,
	OrgServicePhoneSchema,
	OrgServiceSchema,
	OrgServiceTagSchema,
	OrgSocialMediaSchema,
	OrgWebsiteLanguageSchema,
	OrgWebsiteSchema,
	OrganizationAttributeSchema,
	OrganizationPermissionSchema,
	OutsideAPISchema,
	ServiceAccessAttributeSchema,
	ServiceAccessSchema,
	ServiceAreaCountrySchema,
	ServiceAreaDistSchema,
	ServiceAreaSchema,
	ServiceAttributeSchema,
	TranslationKeySchema,
	UserPermissionSchema,
	UserToOrganizationSchema,
} from '~db/zod-schemas'

export const zodBaseSchema = {
	translationKey: TranslationKeySchema,
	freeText: FreeTextSchema,
	orgLocation: OrgLocationSchema,
	orgPhone: OrgPhoneSchema,
	orgEmail: OrgEmailSchema,
	orgWebsite: OrgWebsiteSchema,
	orgWebsiteLanguage: OrgWebsiteLanguageSchema,
	orgSocialMedia: OrgSocialMediaSchema,
	outsideAPI: OutsideAPISchema,
	orgPhoto: OrgPhotoSchema,
	orgHours: OrgHoursSchema,
	orgService: OrgServiceSchema,
	serviceAccess: ServiceAccessSchema,
	attributeSupplement: AttributeSupplementSchema,
	orgServicePhone: OrgServicePhoneSchema,
	orgServiceEmail: OrgServiceEmailSchema,
	orgLocationService: OrgLocationServiceSchema,
	orgServiceTag: OrgServiceTagSchema,
	organizationAttribute: OrganizationAttributeSchema,
	serviceAttribute: ServiceAttributeSchema,
	serviceAccessAttribute: ServiceAccessAttributeSchema,
	serviceArea: ServiceAreaSchema,
	serviceAreaCountry: ServiceAreaCountrySchema,
	serviceAreaDist: ServiceAreaDistSchema,
	userToOrganization: UserToOrganizationSchema,
	userPermission: UserPermissionSchema,
	organizationPermission: OrganizationPermissionSchema,
} as const
export type ZodBaseSchema = {
	[K in keyof typeof zodBaseSchema]: K extends keyof typeof zodBaseSchema
		? z.infer<(typeof zodBaseSchema)[K]>
		: never
}

type zodInput = {
	translationKey: Prisma.TranslationKeyCreateManyInput
	freeText: Prisma.FreeTextCreateManyInput
	orgLocation: Prisma.OrgLocationCreateManyInput
	orgPhone: Prisma.OrgPhoneCreateManyInput
	orgEmail: Prisma.OrgEmailCreateManyInput
	orgWebsite: Prisma.OrgWebsiteCreateManyInput
	orgWebsiteLanguage: Prisma.OrgWebsiteLanguageCreateManyInput
	orgSocialMedia: Prisma.OrgSocialMediaCreateManyInput
	outsideAPI: Prisma.OutsideAPICreateManyInput
	orgPhoto: Prisma.OrgPhotoCreateManyInput
	orgHours: Prisma.OrgHoursCreateManyInput
	orgService: Prisma.OrgServiceCreateManyInput
	serviceAccess: Prisma.ServiceAccessCreateManyInput
	attributeSupplement: Prisma.AttributeSupplementCreateManyInput
	orgServicePhone: Prisma.OrgServicePhoneCreateManyInput
	orgServiceEmail: Prisma.OrgServiceEmailCreateManyInput
	orgLocationService: Prisma.OrgLocationServiceCreateManyInput
	orgServiceTag: Prisma.OrgServiceTagCreateManyInput
	organizationAttribute: Prisma.OrganizationAttributeCreateManyInput
	serviceAttribute: Prisma.ServiceAttributeCreateManyInput
	serviceAccessAttribute: Prisma.ServiceAccessAttributeCreateManyInput
	serviceArea: Prisma.ServiceAreaCreateManyInput
	serviceAreaCountry: Prisma.ServiceAreaCountryCreateManyInput
	serviceAreaDist: Prisma.ServiceAreaDistCreateManyInput
	userToOrganization: Prisma.UserToOrganizationCreateManyInput
	userPermission: Prisma.UserPermissionCreateManyInput
	organizationPermission: Prisma.OrganizationPermissionCreateManyInput
}
export type ZodInputs = {
	-readonly [P in BatchNames]: P extends BatchNames ? zodInput[P][] : never
}
export type ZodInput<K extends BatchNames> = K extends BatchNames ? zodInput[K] : never
type zodFindMany = {
	translationKey: Prisma.TranslationKeyFindManyArgs
	freeText: Prisma.FreeTextFindManyArgs
	orgLocation: Prisma.OrgLocationFindManyArgs
	orgPhone: Prisma.OrgPhoneFindManyArgs
	orgEmail: Prisma.OrgEmailFindManyArgs
	orgWebsite: Prisma.OrgWebsiteFindManyArgs
	orgWebsiteLanguage: Prisma.OrgWebsiteLanguageFindManyArgs
	orgSocialMedia: Prisma.OrgSocialMediaFindManyArgs
	outsideAPI: Prisma.OutsideAPIFindManyArgs
	orgPhoto: Prisma.OrgPhotoFindManyArgs
	orgHours: Prisma.OrgHoursFindManyArgs
	orgService: Prisma.OrgServiceFindManyArgs
	serviceAccess: Prisma.ServiceAccessFindManyArgs
	attributeSupplement: Prisma.AttributeSupplementFindManyArgs
	orgServicePhone: Prisma.OrgServicePhoneFindManyArgs
	orgServiceEmail: Prisma.OrgServiceEmailFindManyArgs
	orgLocationService: Prisma.OrgLocationServiceFindManyArgs
	orgServiceTag: Prisma.OrgServiceTagFindManyArgs
	organizationAttribute: Prisma.OrganizationAttributeFindManyArgs
	serviceAttribute: Prisma.ServiceAttributeFindManyArgs
	serviceAccessAttribute: Prisma.ServiceAccessAttributeFindManyArgs
	serviceArea: Prisma.ServiceAreaFindManyArgs
	serviceAreaCountry: Prisma.ServiceAreaCountryFindManyArgs
	serviceAreaDist: Prisma.ServiceAreaDistFindManyArgs
	userToOrganization: Prisma.UserToOrganizationFindManyArgs
	userPermission: Prisma.UserPermissionFindManyArgs
	organizationPermission: Prisma.OrganizationPermissionFindManyArgs
}
export type ZodFindMany = {
	[K in keyof zodFindMany]: K extends keyof zodFindMany ? zodFindMany[K] : never
}
