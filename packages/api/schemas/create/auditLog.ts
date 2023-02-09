import { Prisma } from '@weareinreach/db'
import superjson from 'superjson'
import { z } from 'zod'

import { cuidOptional, JsonInputOrNullSuperJSON } from '../common'

const auditLogLinks = z.object({
	accountId: cuidOptional,
	attributeCategoryId: cuidOptional,
	attributeId: cuidOptional,
	attributeSupplementId: cuidOptional,
	countryId: cuidOptional,
	fieldVisibilityId: cuidOptional,
	footerLinkId: cuidOptional,
	freeTextId: cuidOptional,
	govDistId: cuidOptional,
	govDistTypeId: cuidOptional,
	internalNoteId: cuidOptional,
	languageId: cuidOptional,
	locationPermissionOrgLocationId: cuidOptional,
	locationPermissionPermissionId: cuidOptional,
	locationPermissionUserId: cuidOptional,
	navigationId: cuidOptional,
	organizationId: cuidOptional,
	organizationPermissionOrganizationId: cuidOptional,
	organizationPermissionPermissionId: cuidOptional,
	organizationPermissionUserId: cuidOptional,
	orgEmailId: cuidOptional,
	orgHoursId: cuidOptional,
	orgLocationId: cuidOptional,
	orgPhoneId: cuidOptional,
	orgPhotoId: cuidOptional,
	orgReviewId: cuidOptional,
	orgServiceId: cuidOptional,
	orgSocialMediaId: cuidOptional,
	orgWebsiteId: cuidOptional,
	outsideAPIId: cuidOptional,
	outsideAPIServiceService: z.string().nullish(),
	permissionId: cuidOptional,
	phoneTypeId: cuidOptional,
	serviceAccessId: cuidOptional,
	serviceAreaId: cuidOptional,
	serviceCategoryId: cuidOptional,
	serviceTagId: cuidOptional,
	socialMediaLinkId: cuidOptional,
	socialMediaServiceId: cuidOptional,
	sourceId: cuidOptional,
	translatedReviewId: cuidOptional,
	translationKey: z.string().nullish(),
	translationNamespaceName: z.string().nullish(),
	translationNs: z.string().nullish(),
	userCommunityId: cuidOptional,
	userEthnicityId: cuidOptional,
	userId: cuidOptional,
	userImmigrationId: cuidOptional,
	userMailId: cuidOptional,
	userRoleId: cuidOptional,
	userSavedListId: cuidOptional,
	userSOGIdentityId: cuidOptional,
	userTitleId: cuidOptional,
	userTypeId: cuidOptional,
})

const AuditLogCreate = z.object({
	actorId: z.string(),
	to: JsonInputOrNullSuperJSON,
	operation: z.enum(['CREATE']),
})

const AuditLogLink = z.object({
	actorId: z.string(),
	to: JsonInputOrNullSuperJSON,
	operation: z.enum(['LINK']),
})

const AuditLogUpdateDeleteUnlink = z.object({
	actorId: z.string(),
	from: JsonInputOrNullSuperJSON,
	to: JsonInputOrNullSuperJSON,
	operation: z.enum(['UPDATE', 'DELETE', 'UNLINK']),
})

export const AuditLogBaseUnion = z.discriminatedUnion('operation', [
	AuditLogCreate,
	AuditLogLink,
	AuditLogUpdateDeleteUnlink,
])
const AuditLogExtended = AuditLogBaseUnion.and(auditLogLinks)

const transformer = (data: z.output<typeof AuditLogBaseUnion | typeof AuditLogExtended>) => {
	switch (data.operation) {
		case 'CREATE': {
			return Prisma.validator<Prisma.AuditLogUncheckedCreateInput>()({
				...data,
				from: JsonInputOrNullSuperJSON.parse({}),
			})
		}
		case 'LINK': {
			return Prisma.validator<Prisma.AuditLogUncheckedCreateInput>()({
				...data,
				from: JsonInputOrNullSuperJSON.parse({}),
				to: JsonInputOrNullSuperJSON.parse({ linked: true }),
			})
		}
		case 'DELETE':
		case 'UNLINK':
		case 'UPDATE': {
			return Prisma.validator<Prisma.AuditLogUncheckedCreateInput>()(data)
		}
	}
}

export const AuditLogSchema = AuditLogExtended.transform((data) => transformer(data))
export const AuditLogNestedSchema = AuditLogBaseUnion.transform((data) => transformer(data))

type AuditLogSchema = typeof AuditLogSchema

export type AuditLog = z.infer<AuditLogSchema>
export type AuditLogInput = z.input<AuditLogSchema>

/** Generates AuditLog object ONLY */
export const GenerateAuditLog = (data: AuditLogInput) => AuditLogSchema.parse(data)
/** Generates AuditLog inside of a nested `create` object */
export const CreateAuditLog = (data: AuditLogInput) => ({ create: GenerateAuditLog(data) })

export const auditLogLinkAction = { linked: true }
