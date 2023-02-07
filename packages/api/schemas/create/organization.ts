import { Prisma } from '@weareinreach/db'
import { namespaces } from '@weareinreach/db/seed/data'
import { z } from 'zod'

import { createAuditLog } from '~api/lib'

import { CreateNestedOrgEmailPrisma, CreateNestedOrgEmailSchema } from './orgEmail'
import { CreateNestedOrgLocationPrisma, CreateNestedOrgLocationSchema } from './orgLocation'
import { CreateNestedOrgPhonePrisma, CreateNestedOrgPhoneSchema } from './orgPhone'
import { CreateNestedOrgSocialMediaSchema, CreateNestedOrgSocialMediaPrisma } from './orgSocialMedia'
import { CreateNestedOrgWebsitePrisma, CreateNestedOrgWebsiteSchema } from './orgWebsite'

export const CreateQuickOrgSchema = z.object({
	name: z.string(),
	slug: z.string(),
	source: z.string(),
	description: z.string().optional(),
	locations: CreateNestedOrgLocationSchema.optional(),
	emails: CreateNestedOrgEmailSchema.optional(),
	phones: CreateNestedOrgPhoneSchema.optional(),
	websites: CreateNestedOrgWebsiteSchema.optional(),
	socialMedia: CreateNestedOrgSocialMediaSchema.optional(),
})

const createDescription = (slug: string, text?: string) => {
	if (!text) return undefined
	return {
		create: {
			tsKey: {
				create: {
					key: slug,
					namespace: {
						connect: {
							name: namespaces.orgDescription,
						},
					},
					text: text,
				},
			},
		},
	}
}

export const CreateOrgPrisma = (data: z.infer<typeof CreateQuickOrgSchema>) => {
	return Prisma.validator<Prisma.OrganizationCreateInput>()({
		name: data.name,
		slug: data.slug,
		source: {
			connect: {
				source: data.source,
			},
		},
		description: createDescription(data.slug, data.description),
		locations: CreateNestedOrgLocationPrisma(data.locations),
		emails: CreateNestedOrgEmailPrisma(data.emails),
		phones: CreateNestedOrgPhonePrisma(data.phones),
		websites: CreateNestedOrgWebsitePrisma(data.websites),
		socialMedia: CreateNestedOrgSocialMediaPrisma(data.socialMedia),
	})
}
