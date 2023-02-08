import { Prisma } from '@weareinreach/db'
import superjson from 'superjson'
import { z } from 'zod'

import { JsonInputOrNullSuperJSON } from '../common'

export const AuditLogSchema = z
	.object({
		actorId: z.string(),
		from: JsonInputOrNullSuperJSON,
		to: JsonInputOrNullSuperJSON,
		operation: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LINK', 'UNLINK']),

		accountId: z.string().optional(),
		attributeCategoryId: z.string().optional(),
		attributeId: z.string().optional(),
		attributeSupplementId: z.string().optional(),
		countryId: z.string().optional(),
		fieldVisibilityId: z.string().optional(),
		footerLinkId: z.string().optional(),
		freeTextId: z.string().optional(),
		govDistId: z.string().optional(),
		govDistTypeId: z.string().optional(),
		internalNoteId: z.string().optional(),
		languageId: z.string().optional(),
		locationPermissionOrgLocationId: z.string().optional(),
		locationPermissionPermissionId: z.string().optional(),
		locationPermissionUserId: z.string().optional(),
		navigationId: z.string().optional(),
		organizationId: z.string().optional(),
		organizationPermissionOrganizationId: z.string().optional(),
		organizationPermissionPermissionId: z.string().optional(),
		organizationPermissionUserId: z.string().optional(),
		orgEmailId: z.string().optional(),
		orgHoursId: z.string().optional(),
		orgLocationId: z.string().optional(),
		orgPhoneId: z.string().optional(),
		orgPhotoId: z.string().optional(),
		orgReviewId: z.string().optional(),
		orgServiceId: z.string().optional(),
		orgSocialMediaId: z.string().optional(),
		orgWebsiteId: z.string().optional(),
		outsideAPIId: z.string().optional(),
		outsideAPIServiceService: z.string().optional(),
		permissionId: z.string().optional(),
		phoneTypeId: z.string().optional(),
		serviceAccessId: z.string().optional(),
		serviceAreaId: z.string().optional(),
		serviceCategoryId: z.string().optional(),
		serviceTagId: z.string().optional(),
		socialMediaLinkId: z.string().optional(),
		socialMediaServiceId: z.string().optional(),
		sourceId: z.string().optional(),
		translatedReviewId: z.string().optional(),
		translationKey: z.string().optional(),
		translationNamespaceName: z.string().optional(),
		translationNs: z.string().optional(),
		userCommunityId: z.string().optional(),
		userEthnicityId: z.string().optional(),
		userId: z.string().optional(),
		userImmigrationId: z.string().optional(),
		userMailId: z.string().optional(),
		userRoleId: z.string().optional(),
		userSavedListId: z.string().optional(),
		userSOGIdentityId: z.string().optional(),
		userTitleId: z.string().optional(),
		userTypeId: z.string().optional(),
	})
	.transform((data) => Prisma.validator<Prisma.AuditLogUncheckedCreateInput>()(data))

export type AuditLog = z.infer<typeof AuditLogSchema>

export const GenerateAuditLog = (data: z.input<typeof AuditLogSchema>) => AuditLogSchema.parse(data)
