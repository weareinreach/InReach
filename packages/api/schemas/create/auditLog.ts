import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { idOptional, JsonInputOrNullSuperJSON } from '~api/schemas/common'

const auditLogLinks = z.object({
	accountId: idOptional,
	attributeCategoryId: idOptional,
	attributeId: idOptional,
	attributeSupplementId: idOptional,
	countryId: idOptional,
	fieldVisibilityId: idOptional,
	footerLinkId: idOptional,
	freeTextId: idOptional,
	govDistId: idOptional,
	govDistTypeId: idOptional,
	internalNoteId: idOptional,
	languageId: idOptional,
	locationPermissionOrgLocationId: idOptional,
	locationPermissionPermissionId: idOptional,
	locationPermissionUserId: idOptional,
	navigationId: idOptional,
	organizationId: idOptional,
	organizationPermissionOrganizationId: idOptional,
	organizationPermissionPermissionId: idOptional,
	organizationPermissionUserId: idOptional,
	orgEmailId: idOptional,
	orgHoursId: idOptional,
	orgLocationId: idOptional,
	orgPhoneId: idOptional,
	orgPhotoId: idOptional,
	orgReviewId: idOptional,
	orgServiceId: idOptional,
	orgSocialMediaId: idOptional,
	orgWebsiteId: idOptional,
	outsideAPIId: idOptional,
	outsideAPIServiceService: z.string().nullish(),
	permissionId: idOptional,
	phoneTypeId: idOptional,
	serviceAccessId: idOptional,
	serviceAreaId: idOptional,
	serviceCategoryId: idOptional,
	serviceTagId: idOptional,
	socialMediaLinkId: idOptional,
	socialMediaServiceId: idOptional,
	sourceId: idOptional,
	translatedReviewId: idOptional,
	translationKey: z.string().nullish(),
	translationNamespaceName: z.string().nullish(),
	translationNs: z.string().nullish(),
	userCommunityId: idOptional,
	userEthnicityId: idOptional,
	userId: idOptional,
	userImmigrationId: idOptional,
	userMailId: idOptional,
	userRoleId: idOptional,
	userSavedListId: idOptional,
	userSOGIdentityId: idOptional,
	userTitleId: idOptional,
	userTypeId: idOptional,
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
				to: data.to ?? JsonInputOrNullSuperJSON.parse({ linked: true }),
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
