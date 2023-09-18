import { z } from 'zod'

import { generateId, generateNestedFreeText, Prisma } from '@weareinreach/db'
import { prefixedId } from '~api/schemas/idPrefix'
import { connectOneId } from '~api/schemas/nestedOps'

export const ZCreateSchema = z
	.object({
		orgId: prefixedId('organization'),
		data: z.object({
			url: z.string(),
			isPrimary: z.boolean().optional(),
			published: z.boolean().optional(),
			organizationId: prefixedId('organization').optional(),
			orgLocationId: prefixedId('orgLocation').optional(),
			orgLocationOnly: z.boolean(),
			description: z.string().optional(),
		}),
	})
	.transform(({ data, orgId }) => {
		const id = generateId('orgWebsite')
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
export type TCreateSchema = z.infer<typeof ZCreateSchema>
