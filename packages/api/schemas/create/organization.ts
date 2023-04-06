import { Prisma, generateId } from '@weareinreach/db'
import { z } from 'zod'

import { idString, CreationBase } from '~api/schemas/common'
import { createManyWithAudit } from '~api/schemas/nestedOps'

import { CreateAuditLog } from './auditLog'
import { SuggestionSchema } from './browserSafe/suggestOrg'
import { createFreeText } from './freeText'
import { CreateNestedOrgEmailSchema } from './orgEmail'
import { CreateNestedOrgLocationSchema } from './orgLocation'
import { CreateNestedOrgPhoneSchema } from './orgPhone'
import { CreateNestedOrgSocialMediaSchema } from './orgSocialMedia'
import { CreateNestedOrgWebsiteSchema } from './orgWebsite'

const CreateOrgBase = {
	name: z.string(),
	slug: z.string(),
	sourceId: idString,
}
const CreateOrgLinks = {
	description: z.string().optional(),
	locations: CreateNestedOrgLocationSchema.optional(),
	emails: CreateNestedOrgEmailSchema.optional(),
	phones: CreateNestedOrgPhoneSchema.optional(),
	websites: CreateNestedOrgWebsiteSchema.optional(),
	socialMedia: CreateNestedOrgSocialMediaSchema.optional(),
}
const CreateQuickOrg = z.object({ ...CreateOrgBase, ...CreateOrgLinks })

export const CreateQuickOrgSchema = () => {
	const { dataParser: parser, inputSchema } = CreationBase(CreateQuickOrg)

	const dataParser = parser.transform(({ actorId, operation, data }) => {
		const { name, slug, sourceId } = data
		return Prisma.validator<Prisma.OrganizationCreateArgs>()({
			data: {
				name,
				slug,
				source: {
					connect: { id: sourceId },
				},
				description: createFreeText(data.slug, data.description),
				locations: createManyWithAudit(data.locations, actorId),
				emails: createManyWithAudit(data.emails, actorId),
				phones: createManyWithAudit(data.phones, actorId),
				socialMedia: createManyWithAudit(data.socialMedia, actorId),
				websites: createManyWithAudit(data.websites, actorId),
				auditLogs: CreateAuditLog({ actorId, operation, to: { name, slug, sourceId } }),
			},
			include: {
				description: Boolean(data.description),
				locations: Boolean(data.locations),
				emails: Boolean(data.emails),
				phones: Boolean(data.phones),
				websites: Boolean(data.websites),
				socialMedia: Boolean(data.socialMedia),
			},
		})
	})
	return { dataParser, inputSchema }
}

export const CreateOrgSuggestionSchema = () => {
	const { dataParser: parser, inputSchema } = CreationBase(SuggestionSchema)
	const dataParser = parser.transform(({ actorId, operation, data }) => {
		const { countryId, orgName, orgSlug, communityFocus, orgAddress, orgWebsite, serviceCategories } = data
		const organizationId = generateId('organization')

		return Prisma.validator<Prisma.SuggestionCreateArgs>()({
			data: {
				organization: {
					create: {
						id: organizationId,
						name: orgName,
						slug: orgSlug,
						source: { connect: { source: 'suggestion' } },
					},
				},
				data: {
					orgWebsite,
					orgAddress,
					countryId,
					communityFocus,
					serviceCategories,
				},
				auditLogs: CreateAuditLog({ actorId, operation, to: data, organizationId }),
			},
			select: {
				id: true,
			},
		})
	})
	return { dataParser, inputSchema }
}

type CreateQuickOrgReturn = ReturnType<typeof CreateQuickOrgSchema>
export type CreateQuickOrgData = z.infer<CreateQuickOrgReturn['dataParser']>
export type CreateQuickOrgInput = z.input<CreateQuickOrgReturn['dataParser']>
type CreateOrgSuggestionReturn = ReturnType<typeof CreateOrgSuggestionSchema>
export type CreateOrgSuggestionInput = z.input<CreateOrgSuggestionReturn['dataParser']>
