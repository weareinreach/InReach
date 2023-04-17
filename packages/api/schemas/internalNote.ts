import { Prisma, generateId } from '@weareinreach/db'
import flush from 'just-flush'
import { z } from 'zod'

import { CreationBase, prefixedUlid, nonEmptyString } from '~api/schemas/common'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'

const idFields = {
	attributeId: prefixedUlid.optional(),
	attributeCategoryId: prefixedUlid.optional(),
	attributeSupplementId: prefixedUlid.optional(),
	attributeSupplementDataSchemaId: prefixedUlid.optional(),
	countryId: prefixedUlid.optional(),
	govDistId: prefixedUlid.optional(),
	govDistTypeId: prefixedUlid.optional(),
	languageId: prefixedUlid.optional(),
	organizationId: prefixedUlid.optional(),
	orgEmailId: prefixedUlid.optional(),
	orgHoursId: prefixedUlid.optional(),
	orgLocationId: prefixedUlid.optional(),
	orgPhoneId: prefixedUlid.optional(),
	orgPhotoId: prefixedUlid.optional(),
	orgReviewId: prefixedUlid.optional(),
	orgServiceId: prefixedUlid.optional(),
	orgSocialMediaId: prefixedUlid.optional(),
	orgWebsiteId: prefixedUlid.optional(),
	outsideApiId: prefixedUlid.optional(),
	outsideAPIServiceService: nonEmptyString.optional(),
	permissionId: prefixedUlid.optional(),
	phoneTypeId: prefixedUlid.optional(),
	serviceAccessId: prefixedUlid.optional(),
	serviceCategoryId: prefixedUlid.optional(),
	serviceTagId: prefixedUlid.optional(),
	socialMediaLinkId: prefixedUlid.optional(),
	socialMediaServiceId: prefixedUlid.optional(),
	sourceId: prefixedUlid.optional(),
	suggestionId: prefixedUlid.optional(),
	translationKey: nonEmptyString.optional(),
	translationNs: nonEmptyString.optional(),
	translationNamespaceName: nonEmptyString.optional(),
}

export const GetNoteByRecord = z.object(idFields).superRefine((data, ctx) => {
	const keys = Object.keys(flush(data))
	if (keys.length === 0) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'At least one key required',
		})
		return z.NEVER
	}
	if (keys.includes('translationKey') || keys.includes('translationNs')) {
		if (!keys.includes('translationKey') && keys.includes('translationNs')) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: '`translationKey` and `translationNs` are both required.',
			})
			return z.NEVER
		}
	}
})

const CreateNoteBase = z.object({
	text: z.string(),
	...idFields,
})

export const CreateNote = () => {
	const { dataParser: parser, inputSchema } = CreationBase(CreateNoteBase)
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
