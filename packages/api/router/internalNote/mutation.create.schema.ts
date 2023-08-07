import flush from 'just-flush'
import { z } from 'zod'

import { generateId, Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'

const nonEmptyString = z
	.string()
	.transform((val) => (String(val).trim() === '' ? undefined : String(val).trim()))

export const ZCreateSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(
		z.object({
			text: z.string(),
			attributeId: prefixedId('attribute').optional(),
			attributeCategoryId: prefixedId('attributeCategory').optional(),
			attributeSupplementId: prefixedId('attributeSupplement').optional(),
			attributeSupplementDataSchemaId: prefixedId('attributeSupplementDataSchema').optional(),
			countryId: prefixedId('country').optional(),
			govDistId: prefixedId('govDist').optional(),
			govDistTypeId: prefixedId('govDistType').optional(),
			languageId: prefixedId('language').optional(),
			organizationId: prefixedId('organization').optional(),
			orgEmailId: prefixedId('orgEmail').optional(),
			orgHoursId: prefixedId('orgHours').optional(),
			orgLocationId: prefixedId('orgLocation').optional(),
			orgPhoneId: prefixedId('orgPhone').optional(),
			orgPhotoId: prefixedId('orgPhoto').optional(),
			orgReviewId: prefixedId('orgReview').optional(),
			orgServiceId: prefixedId('orgService').optional(),
			orgSocialMediaId: prefixedId('orgSocialMedia').optional(),
			orgWebsiteId: prefixedId('orgWebsite').optional(),
			outsideApiId: prefixedId('outsideAPI').optional(),
			permissionId: prefixedId('permission').optional(),
			phoneTypeId: prefixedId('phoneType').optional(),
			serviceCategoryId: prefixedId('serviceCategory').optional(),
			serviceTagId: prefixedId('serviceTag').optional(),
			socialMediaLinkId: prefixedId('socialMediaLink').optional(),
			socialMediaServiceId: prefixedId('socialMediaService').optional(),
			sourceId: prefixedId('source').optional(),
			suggestionId: prefixedId('suggestion').optional(),
			outsideAPIServiceService: nonEmptyString.optional(),
			translationKey: nonEmptyString.optional(),
			translationNs: nonEmptyString.optional(),
			translationNamespaceName: nonEmptyString.optional(),
		})
	)
	const dataParser = parser
		.superRefine(({ data }, ctx) => {
			const links = flush(data)
			const keys = Object.keys(links).filter((key) => key !== 'text')
			if (keys.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'At least one ID key required',
				})
				return z.NEVER
			}
			if (keys.includes('translationKey') || keys.includes('translationNs')) {
				if (!keys.includes('translationKey') || !keys.includes('translationNs')) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: '`translationKey` and `translationNs` are both required.',
					})
					return z.NEVER
				}
			}
		})
		.transform(({ actorId, operation, data }) => {
			const { text, ...links } = data
			const trimmedLinks = flush(links)
			const id = generateId('internalNote')
			const internalNote = Prisma.validator<Prisma.InternalNoteCreateArgs>()({
				data: { id, text, ...trimmedLinks },
				select: { id: true },
			})
			const auditLog = Prisma.validator<Prisma.AuditLogCreateArgs>()({
				data: GenerateAuditLog({
					actorId,
					operation,
					to: { text, ...trimmedLinks },
					internalNoteId: id,
					...trimmedLinks,
				}),
				select: { id: true },
			})
			return { internalNote, auditLog }
		})
	return { dataParser, inputSchema }
}
export type TCreateSchema = z.infer<ReturnType<typeof ZCreateSchema>['inputSchema']>
