import { Prisma, PrismaClient, AuditLog, prisma } from '@weareinreach/db'
import { z, ZodRawShape, ZodSchema } from 'zod'

import { JsonInputOrNull } from './common'

type ConnectUser = {
	connect: Prisma.UserWhereUniqueInput
}
export const connectUser = (id: string): ConnectUser => ({ connect: { id } })

const id = z.string().cuid()

const BaseSchema = z.object({
	actorId: id,
	from: JsonInputOrNull,
	to: JsonInputOrNull,
})

export const AuditLogSchema = {
	account: BaseSchema.extend({ accountId: id }),
	attribute: BaseSchema.extend({ attributeId: id }),
	attributeCategory: BaseSchema.extend({ attributeCategoryId: id }),
	attributeSupplement: BaseSchema.extend({ attributeSupplementId: id }),
	country: BaseSchema.extend({ countryId: id }),
	fieldVisibility: BaseSchema.extend({ fieldVisibilityId: id }),
	footerLink: BaseSchema.extend({ footerLinkId: id }),
	freeText: BaseSchema.extend({ freeTextId: id }),
	govDist: BaseSchema.extend({ govDistId: id }),
	govDistType: BaseSchema.extend({ govDistTypeId: id }),
	internalNote: BaseSchema.extend({ internalNoteId: id }),
	language: BaseSchema.extend({ languageId: id }),
	locationPermission: BaseSchema.extend({
		locationPermissionUserId: id,
		locationPermissionPermissionId: id,
		locationPermissionOrgLocationId: id,
	}),
	navigation: BaseSchema.extend({ navigationId: id }),
	organization: BaseSchema.extend({ organizationId: id }),
	organizationPermission: BaseSchema.extend({
		organizationPermissionUserId: id,
		organizationPermissionPermissionId: id,
		organizationPermissionOrganizationId: id,
	}),
	orgEmail: BaseSchema.extend({ orgEmailId: id }),
	orgHours: BaseSchema.extend({ orgHoursId: id }),
	orgLocation: BaseSchema.extend({ orgLocationId: id }),
	orgPhone: BaseSchema.extend({ orgPhoneId: id }),
	orgPhoto: BaseSchema.extend({ orgPhotoId: id }),
	orgReview: BaseSchema.extend({ orgReviewId: id }),
	orgService: BaseSchema.extend({ orgServiceId: id }),
	orgSocialMedia: BaseSchema.extend({ orgSocialMediaId: id }),
	orgWebsite: BaseSchema.extend({ orgWebsiteId: id }),
	outsideAPI: BaseSchema.extend({ outsideAPIId: id }),
	outsideAPIService: BaseSchema.extend({ outsideAPIServiceService: z.string() }),
	permission: BaseSchema.extend({ permissionId: id }),
	phoneType: BaseSchema.extend({ phoneTypeId: id }),
	serviceAccess: BaseSchema.extend({ serviceAccessId: id }),
	serviceArea: BaseSchema.extend({ serviceAreaId: id }),
	serviceCategory: BaseSchema.extend({ serviceCategoryId: id }),
	serviceTag: BaseSchema.extend({ serviceTagId: id }),
	socialMediaLink: BaseSchema.extend({ socialMediaLinkId: id }),
	socialMediaService: BaseSchema.extend({ socialMediaServiceId: id }),
	source: BaseSchema.extend({ sourceId: id }),
	translatedReview: BaseSchema.extend({ translatedReviewId: id }),
	translationKey: BaseSchema.extend({
		translationKey: z.string(),
		translationNs: z.string(),
	}),
	translationNamespace: BaseSchema.extend({ translationNamespaceName: id }),
	user: BaseSchema.extend({ userId: id }),
	userCommunity: BaseSchema.extend({ userCommunityId: id }),
	userEthnicity: BaseSchema.extend({ userEthnicityId: id }),
	userImmigration: BaseSchema.extend({ userImmigrationId: id }),
	userMail: BaseSchema.extend({ userMailId: id }),
	userRole: BaseSchema.extend({ userRoleId: id }),
	userSavedList: BaseSchema.extend({ userSavedListId: id }),
	userSOGIdentity: BaseSchema.extend({ userSOGIdentityId: id }),
	userTitle: BaseSchema.extend({ userTitleId: id }),
	userType: BaseSchema.extend({ userTypeId: id }),

	assignedRole: BaseSchema.extend({
		userId: id,
		roleId: id,
	}),
	attributeToCategory: BaseSchema.extend({
		attributeId: id,
		categoryId: id,
	}),
	listSharedWith: BaseSchema.extend({
		userId: id,
		listId: id,
	}),
	locationAttribute: BaseSchema.extend({
		locationId: id,
		attributeId: id,
		supplementId: id.nullish(),
	}),
	organizationAttribute: BaseSchema.extend({
		organizationId: id,
		attributeId: id,
		supplementId: id.nullish(),
	}),
	orgLocationEmail: BaseSchema.extend({
		orgLocationId: id,
		orgEmailId: id,
	}),
	orgLocationPhone: BaseSchema.extend({
		orgLocationId: id,
		phoneId: id,
	}),
	orgLocationService: BaseSchema.extend({
		orgLocationId: id,
		serviceId: id,
	}),
	orgPhoneLanguage: BaseSchema.extend({
		orgPhoneId: id,
		languageId: id,
	}),
	orgServiceEmail: BaseSchema.extend({
		orgEmailId: id,
		serviceId: id,
	}),
	orgServicePhone: BaseSchema.extend({
		orgPhoneId: id,
		serviceId: id,
	}),
	orgServiceTag: BaseSchema.extend({
		serviceId: id,
		tagId: id,
	}),
	orgWebsiteLanguage: BaseSchema.extend({
		orgWebsiteId: id,
		languageId: id,
	}),
	rolePermission: BaseSchema.extend({
		roleId: id,
		permissionId: id,
	}),
	savedOrganization: BaseSchema.extend({
		listId: id,
		organizationId: id,
	}),
	savedService: BaseSchema.extend({
		listId: id,
		serviceId: id,
	}),
	serviceAccessAttribute: BaseSchema.extend({
		serviceAccessId: id,
		attributeId: id,
		supplementId: id.nullish(),
	}),
	serviceAreaCountry: BaseSchema.extend({
		serviceAreaId: id,
		countryId: id,
	}),
	serviceAreaDist: BaseSchema.extend({
		serviceAreaId: id,
		govDistId: id,
	}),
	serviceAttribute: BaseSchema.extend({
		orgServiceId: id,
		attributeId: id,
		supplementId: id.nullish(),
	}),
	serviceCategoryDefaultAttribute: BaseSchema.extend({
		attributeId: id,
		categoryId: id,
	}),
	serviceTagDefaultAttribute: BaseSchema.extend({
		attributeId: id,
		serviceId: id,
	}),
	userCommunityLink: BaseSchema.extend({
		userId: id,
		communityId: id,
	}),
	userPermission: BaseSchema.extend({
		userId: id,
		permissionId: id,
	}),
	userSOGLink: BaseSchema.extend({
		userId: id,
		sogIdentityId: id,
	}),
	userToOrganization: BaseSchema.extend({
		userId: id,
		organizationId: id,
		orgTitleId: id.nullish(),
		orgEmailId: id.nullish(),
		orgPhoneId: id.nullish(),
	}),
} as const

interface Data extends Partial<AuditLogFields> {
	from: JSON
	to: JSON
	actorId: string
}

export type PrismaTables = keyof Omit<PrismaClient, (typeof excludedKeys)[number]>
const excludedKeys = [
	'$connect',
	'$disconnect',
	'$executeRaw',
	'$executeRawUnsafe',
	'$on',
	'$queryRaw',
	'$queryRawUnsafe',
	'$transaction',
	'$use',
	'auditLog',
	'session',
	'surveyCommunity',
	'surveyEthnicity',
	'surveySOG',
	'userSurvey',
	'verificationToken',
] as const

type AuditLogFields = Omit<AuditLog, (typeof excludedFields)[number]>
const excludedFields = ['actorId', 'from', 'id', 'timestamp', 'to'] as const

export const prismaQueries = {
	account: async ({ id }: { id: string }) => await prisma.account.findUniqueOrThrow({ where: { id } }),
	attribute: async ({ id }: { id: string }) => await prisma.attribute.findUniqueOrThrow({ where: { id } }),
	attributeCategory: async ({ id }: { id: string }) =>
		await prisma.attributeCategory.findUniqueOrThrow({ where: { id } }),
	attributeSupplement: async ({ id }: { id: string }) =>
		await prisma.attributeSupplement.findUniqueOrThrow({ where: { id } }),
	country: async ({ id }: { id: string }) => await prisma.country.findUniqueOrThrow({ where: { id } }),
	fieldVisibility: async ({ id }: { id: string }) =>
		await prisma.fieldVisibility.findUniqueOrThrow({ where: { id } }),
	footerLink: async ({ id }: { id: string }) => await prisma.footerLink.findUniqueOrThrow({ where: { id } }),
	freeText: async ({ id }: { id: string }) => await prisma.freeText.findUniqueOrThrow({ where: { id } }),
	govDist: async ({ id }: { id: string }) => await prisma.govDist.findUniqueOrThrow({ where: { id } }),
	govDistType: async ({ id }: { id: string }) =>
		await prisma.govDistType.findUniqueOrThrow({ where: { id } }),
	internalNote: async ({ id }: { id: string }) =>
		await prisma.internalNote.findUniqueOrThrow({ where: { id } }),
	language: async ({ id }: { id: string }) => await prisma.language.findUniqueOrThrow({ where: { id } }),
	locationPermission: async ({
		orgLocationId,
		permissionId,
		userId,
	}: {
		orgLocationId: string
		permissionId: string
		userId: string
	}) =>
		await prisma.locationPermission.findUniqueOrThrow({
			where: { userId_permissionId_orgLocationId: { orgLocationId, permissionId, userId } },
		}),
	navigation: async ({ id }: { id: string }) => await prisma.navigation.findUniqueOrThrow({ where: { id } }),
	organization: async ({ id }: { id: string }) =>
		await prisma.organization.findUniqueOrThrow({ where: { id } }),
	organizationPermission: async ({
		organizationId,
		permissionId,
		userId,
	}: {
		organizationId: string
		permissionId: string
		userId: string
	}) =>
		await prisma.organizationPermission.findUniqueOrThrow({
			where: { userId_permissionId_organizationId: { organizationId, permissionId, userId } },
		}),
	orgEmail: async ({ id }: { id: string }) => await prisma.orgEmail.findUniqueOrThrow({ where: { id } }),
	orgHours: async ({ id }: { id: string }) => await prisma.orgHours.findUniqueOrThrow({ where: { id } }),
	orgLocation: async ({ id }: { id: string }) =>
		await prisma.orgLocation.findUniqueOrThrow({ where: { id } }),
	orgPhone: async ({ id }: { id: string }) => await prisma.orgPhone.findUniqueOrThrow({ where: { id } }),
	orgPhoto: async ({ id }: { id: string }) => await prisma.orgPhoto.findUniqueOrThrow({ where: { id } }),
	orgReview: async ({ id }: { id: string }) => await prisma.orgReview.findUniqueOrThrow({ where: { id } }),
	orgService: async ({ id }: { id: string }) => await prisma.orgService.findUniqueOrThrow({ where: { id } }),
	orgSocialMedia: async ({ id }: { id: string }) =>
		await prisma.orgSocialMedia.findUniqueOrThrow({ where: { id } }),
	orgWebsite: async ({ id }: { id: string }) => await prisma.orgWebsite.findUniqueOrThrow({ where: { id } }),
	outsideAPI: async ({ id }: { id: string }) => await prisma.outsideAPI.findUniqueOrThrow({ where: { id } }),
	outsideAPIService: async ({ service }: { service: string }) =>
		await prisma.outsideAPIService.findUniqueOrThrow({ where: { service } }),
	permission: async ({ id }: { id: string }) => await prisma.permission.findUniqueOrThrow({ where: { id } }),
	phoneType: async ({ id }: { id: string }) => await prisma.phoneType.findUniqueOrThrow({ where: { id } }),
	serviceAccess: async ({ id }: { id: string }) =>
		await prisma.serviceAccess.findUniqueOrThrow({ where: { id } }),
	serviceArea: async ({ id }: { id: string }) =>
		await prisma.serviceArea.findUniqueOrThrow({ where: { id } }),
	serviceCategory: async ({ id }: { id: string }) =>
		await prisma.serviceCategory.findUniqueOrThrow({ where: { id } }),
	serviceTag: async ({ id }: { id: string }) => await prisma.serviceTag.findUniqueOrThrow({ where: { id } }),
	socialMediaLink: async ({ id }: { id: string }) =>
		await prisma.socialMediaLink.findUniqueOrThrow({ where: { id } }),
	socialMediaService: async ({ id }: { id: string }) =>
		await prisma.socialMediaService.findUniqueOrThrow({ where: { id } }),
	source: async ({ id }: { id: string }) => await prisma.source.findUniqueOrThrow({ where: { id } }),
	translatedReview: async ({ id }: { id: string }) =>
		await prisma.translatedReview.findUniqueOrThrow({ where: { id } }),
	translationKey: async ({ key, ns }: { key: string; ns: string }) =>
		await prisma.translationKey.findUniqueOrThrow({ where: { ns_key: { key, ns } } }),
	translationNamespace: async ({ name }: { name: string }) =>
		await prisma.translationNamespace.findUniqueOrThrow({ where: { name } }),
	user: async ({ id }: { id: string }) => await prisma.user.findUniqueOrThrow({ where: { id } }),
	userCommunity: async ({ id }: { id: string }) =>
		await prisma.userCommunity.findUniqueOrThrow({ where: { id } }),
	userEthnicity: async ({ id }: { id: string }) =>
		await prisma.userEthnicity.findUniqueOrThrow({ where: { id } }),
	userImmigration: async ({ id }: { id: string }) =>
		await prisma.userImmigration.findUniqueOrThrow({ where: { id } }),
	userMail: async ({ id }: { id: string }) => await prisma.userMail.findUniqueOrThrow({ where: { id } }),
	userRole: async ({ id }: { id: string }) => await prisma.userRole.findUniqueOrThrow({ where: { id } }),
	userSavedList: async ({ id }: { id: string }) =>
		await prisma.userSavedList.findUniqueOrThrow({ where: { id } }),
	userSOGIdentity: async ({ id }: { id: string }) =>
		await prisma.userSOGIdentity.findUniqueOrThrow({ where: { id } }),
	userTitle: async ({ id }: { id: string }) => await prisma.userTitle.findUniqueOrThrow({ where: { id } }),
	userType: async ({ id }: { id: string }) => await prisma.userType.findUniqueOrThrow({ where: { id } }),
	assignedRole: async ({ roleId, userId }: { roleId: string; userId: string }) =>
		await prisma.assignedRole.findUniqueOrThrow({ where: { userId_roleId: { roleId, userId } } }),
	attributeToCategory: async ({ attributeId, categoryId }: { attributeId: string; categoryId: string }) =>
		await prisma.attributeToCategory.findUniqueOrThrow({
			where: { attributeId_categoryId: { attributeId, categoryId } },
		}),
	listSharedWith: async ({ listId, userId }: { listId: string; userId: string }) =>
		await prisma.listSharedWith.findUniqueOrThrow({ where: { userId_listId: { listId, userId } } }),
	locationAttribute: async ({
		attributeId,
		locationId,
		supplementId,
	}: {
		attributeId: string
		locationId: string
		supplementId?: string
	}) =>
		await prisma.locationAttribute.findUniqueOrThrow({
			where: { locationId_attributeId: { attributeId, locationId }, supplementId },
		}),
	organizationAttribute: async ({
		attributeId,
		organizationId,
		supplementId,
	}: {
		attributeId: string
		organizationId: string
		supplementId: string
	}) =>
		await prisma.organizationAttribute.findUniqueOrThrow({
			where: { organizationId_attributeId: { attributeId, organizationId }, supplementId },
		}),
	orgLocationEmail: async ({ orgEmailId, orgLocationId }: { orgEmailId: string; orgLocationId: string }) =>
		await prisma.orgLocationEmail.findUniqueOrThrow({
			where: { orgEmailId_orgLocationId: { orgEmailId, orgLocationId } },
		}),
	orgLocationPhone: async ({ orgLocationId, phoneId }: { orgLocationId: string; phoneId: string }) =>
		await prisma.orgLocationPhone.findUniqueOrThrow({
			where: { orgLocationId_phoneId: { orgLocationId, phoneId } },
		}),
	orgLocationService: async ({ orgLocationId, serviceId }: { orgLocationId: string; serviceId: string }) =>
		await prisma.orgLocationService.findUniqueOrThrow({
			where: { orgLocationId_serviceId: { orgLocationId, serviceId } },
		}),
	orgPhoneLanguage: async ({ languageId, orgPhoneId }: { languageId: string; orgPhoneId: string }) =>
		await prisma.orgPhoneLanguage.findUniqueOrThrow({
			where: { orgPhoneId_languageId: { languageId, orgPhoneId } },
		}),
	orgServiceEmail: async ({ orgEmailId, serviceId }: { orgEmailId: string; serviceId: string }) =>
		await prisma.orgServiceEmail.findUniqueOrThrow({
			where: { orgEmailId_serviceId: { orgEmailId, serviceId } },
		}),
	orgServicePhone: async ({ orgPhoneId, serviceId }: { orgPhoneId: string; serviceId: string }) =>
		await prisma.orgServicePhone.findUniqueOrThrow({
			where: { orgPhoneId_serviceId: { orgPhoneId, serviceId } },
		}),
	orgServiceTag: async ({ serviceId, tagId }: { serviceId: string; tagId: string }) =>
		await prisma.orgServiceTag.findUniqueOrThrow({ where: { serviceId_tagId: { serviceId, tagId } } }),
	orgWebsiteLanguage: async ({ languageId, orgWebsiteId }: { languageId: string; orgWebsiteId: string }) =>
		await prisma.orgWebsiteLanguage.findUniqueOrThrow({
			where: { orgWebsiteId_languageId: { languageId, orgWebsiteId } },
		}),
	rolePermission: async ({ permissionId, roleId }: { permissionId: string; roleId: string }) =>
		await prisma.rolePermission.findUniqueOrThrow({
			where: { roleId_permissionId: { permissionId, roleId } },
		}),
	savedOrganization: async ({ listId, organizationId }: { listId: string; organizationId: string }) =>
		await prisma.savedOrganization.findUniqueOrThrow({
			where: { listId_organizationId: { listId, organizationId } },
		}),
	savedService: async ({ listId, serviceId }: { listId: string; serviceId: string }) =>
		await prisma.savedService.findUniqueOrThrow({ where: { listId_serviceId: { listId, serviceId } } }),
	serviceAccessAttribute: async ({
		attributeId,
		serviceAccessId,
		supplementId,
	}: {
		attributeId: string
		serviceAccessId: string
		supplementId?: string
	}) =>
		await prisma.serviceAccessAttribute.findUniqueOrThrow({
			where: { serviceAccessId_attributeId: { attributeId, serviceAccessId }, supplementId },
		}),
	serviceAreaCountry: async ({ countryId, serviceAreaId }: { countryId: string; serviceAreaId: string }) =>
		await prisma.serviceAreaCountry.findUniqueOrThrow({
			where: { serviceAreaId_countryId: { countryId, serviceAreaId } },
		}),
	serviceAreaDist: async ({ govDistId, serviceAreaId }: { govDistId: string; serviceAreaId: string }) =>
		await prisma.serviceAreaDist.findUniqueOrThrow({
			where: { serviceAreaId_govDistId: { govDistId, serviceAreaId } },
		}),
	serviceAttribute: async ({
		attributeId,
		orgServiceId,
		supplementId,
	}: {
		attributeId: string
		orgServiceId: string
		supplementId?: string
	}) =>
		await prisma.serviceAttribute.findUniqueOrThrow({
			where: { orgServiceId_attributeId: { attributeId, orgServiceId }, supplementId },
		}),
	serviceCategoryDefaultAttribute: async ({
		attributeId,
		categoryId,
	}: {
		attributeId: string
		categoryId: string
	}) =>
		await prisma.serviceCategoryDefaultAttribute.findUniqueOrThrow({
			where: { attributeId_categoryId: { attributeId, categoryId } },
		}),
	serviceTagDefaultAttribute: async ({
		attributeId,
		serviceId,
	}: {
		attributeId: string
		serviceId: string
	}) =>
		await prisma.serviceTagDefaultAttribute.findUniqueOrThrow({
			where: { attributeId_serviceId: { attributeId, serviceId } },
		}),
	userCommunityLink: async ({ communityId, userId }: { communityId: string; userId: string }) =>
		await prisma.userCommunityLink.findUniqueOrThrow({
			where: { userId_communityId: { communityId, userId } },
		}),
	userPermission: async ({ permissionId, userId }: { permissionId: string; userId: string }) =>
		await prisma.userPermission.findUniqueOrThrow({
			where: { userId_permissionId: { permissionId, userId } },
		}),
	userSOGLink: async ({ sogIdentityId, userId }: { sogIdentityId: string; userId: string }) =>
		await prisma.userSOGLink.findUniqueOrThrow({
			where: { userId_sogIdentityId: { sogIdentityId, userId } },
		}),
	userToOrganization: async ({
		organizationId,
		userId,
		orgEmailId,
		orgPhoneId,
	}: {
		organizationId: string
		userId: string
		orgEmailId?: string
		orgPhoneId?: string
	}) =>
		await prisma.userToOrganization.findUniqueOrThrow({
			where: { orgEmailId, orgPhoneId, userId_organizationId: { organizationId, userId } },
		}),
} as const

export type QueryParams<K extends PrismaTables> = Parameters<(typeof prismaQueries)[K]>

type ZodData<T extends Readonly<PrismaTables>> = z.input<(typeof AuditLogSchema)[T]>

type qp = {
	[K in PrismaTables]: ZodData<K>
}
