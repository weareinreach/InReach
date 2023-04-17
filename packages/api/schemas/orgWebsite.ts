import { Prisma, generateId, generateNestedFreeText } from '@weareinreach/db'
import { z } from 'zod'

import { connectOneId } from './nestedOps'

export const CreateOrgWebsiteSchema = z
	.object({
		orgSlug: z.string(),
		data: z.object({
			url: z.string(),
			isPrimary: z.boolean().optional(),
			published: z.boolean().optional(),
			organizationId: z.string().optional(),
			orgLocationId: z.string().optional(),
			orgLocationOnly: z.boolean(),
			description: z.string().optional(),
		}),
	})
	.transform(({ data, orgSlug }) => {
		const id = generateId('orgPhone')
		const description = data.description
			? generateNestedFreeText({ orgSlug, itemId: id, text: data.description, type: 'websiteDesc' })
			: undefined

		const { url, isPrimary, published, organizationId, orgLocationId, orgLocationOnly } = data
		return Prisma.validator<Prisma.OrgWebsiteCreateInput>()({
			id,
			url,
			isPrimary,
			published,
			orgLocationOnly,
			description,
			organization: connectOneId(organizationId),
			orgLocation: connectOneId(orgLocationId),
		})
	})

export const UpdateOrgWebsiteSchema = z
	.object({
		id: z.string(),
		data: z
			.object({
				url: z.string(),
				isPrimary: z.boolean(),
				published: z.boolean(),
				deleted: z.boolean(),
				organizationId: z.string(),
				orgLocationId: z.string(),
				orgLocationOnly: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgWebsiteUpdateArgs>()({ where: { id }, data }))
