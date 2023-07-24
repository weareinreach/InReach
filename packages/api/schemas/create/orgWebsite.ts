import { z } from 'zod'

import { generateId, generateNestedFreeText, Prisma } from '@weareinreach/db'

import { connectOneId } from '../nestedOps'

export const CreateOrgWebsiteSchema = z
	.object({
		orgId: z.string(),
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
	.transform(({ data, orgId }) => {
		const id = generateId('orgPhone')
		const description = data.description
			? generateNestedFreeText({ orgId, itemId: id, text: data.description, type: 'websiteDesc' })
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

export const CreateNestedOrgWebsiteSchema = z
	.object({
		url: z.string().url(),
	})
	.array()
	.transform((data) =>
		Prisma.validator<
			Prisma.Enumerable<
				Prisma.OrgWebsiteCreateManyOrganizationInput | Prisma.OrgWebsiteCreateManyOrgLocationInput
			>
		>()(data)
	)

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
