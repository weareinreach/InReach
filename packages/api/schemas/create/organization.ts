import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { createFreeText } from './freeText'
import { CreateNestedOrgEmailSchema } from './orgEmail'
import { CreateNestedOrgLocationSchema } from './orgLocation'
import { CreateNestedOrgPhoneSchema } from './orgPhone'
import { CreateNestedOrgSocialMediaSchema } from './orgSocialMedia'
import { CreateNestedOrgWebsiteSchema } from './orgWebsite'

export const CreateQuickOrgSchema = z
	.object({
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
	.transform((data) =>
		Prisma.validator<Prisma.OrganizationCreateArgs>()({
			data: {
				name: data.name,
				slug: data.slug,
				source: {
					connect: {
						source: data.source,
					},
				},
				description: createFreeText(data.slug, data.description),
				locations: data.locations,
				emails: data.emails,
				phones: data.phones,
				websites: data.websites,
				socialMedia: data.socialMedia,
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
	)

export type CreateQuickOrgData = z.infer<typeof CreateQuickOrgSchema>

// export const CreateOrgPrisma = (data) => {
// 	return Prisma.validator<Prisma.OrganizationCreateInput>()({
// 		name: data.name,
// 		slug: data.slug,
// 		source: {
// 			connect: {
// 				source: data.source,
// 			},
// 		},
// 		description: createDescription(data.slug, data.description),
// 		locations: CreateNestedOrgLocationPrisma(data.locations),
// 		emails: CreateNestedOrgEmailPrisma(data.emails),
// 		phones: CreateNestedOrgPhonePrisma(data.phones),
// 		websites: CreateNestedOrgWebsitePrisma(data.websites),
// 		socialMedia: CreateNestedOrgSocialMediaPrisma(data.socialMedia),
// 	})
// }
