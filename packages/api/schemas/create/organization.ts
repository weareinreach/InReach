import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { cuid, CreationBase } from 'schemas/common'

import { CreateAuditLog } from './auditLog'
import { createManyWithAudit } from './common'
import { createFreeText } from './freeText'
import { CreateNestedOrgEmailSchema } from './orgEmail'
import { CreateNestedOrgLocationSchema } from './orgLocation'
import { CreateNestedOrgPhoneSchema } from './orgPhone'
import { CreateNestedOrgSocialMediaSchema } from './orgSocialMedia'
import { CreateNestedOrgWebsiteSchema } from './orgWebsite'

const CreateOrgBase = z.object({
	name: z.string(),
	slug: z.string(),
	sourceId: cuid,
})
const CreateOrgLinks = z.object({
	description: z.string().optional(),
	locations: CreateNestedOrgLocationSchema.optional(),
	emails: CreateNestedOrgEmailSchema.optional(),
	phones: CreateNestedOrgPhoneSchema.optional(),
	websites: CreateNestedOrgWebsiteSchema.optional(),
	socialMedia: CreateNestedOrgSocialMediaSchema.optional(),
})
const CreateQuickOrg = CreateOrgBase.merge(CreateOrgLinks)

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

type CreateQuickOrgReturn = ReturnType<typeof CreateQuickOrgSchema>
export type CreateQuickOrgData = z.infer<CreateQuickOrgReturn['dataParser']>
export type CreateQuickOrgInput = z.input<CreateQuickOrgReturn['dataParser']>
