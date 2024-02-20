import { z } from 'zod'

import { generateId, generateNestedFreeText, Prisma } from '@weareinreach/db'
import { connectOneId } from '~api/schemas/nestedOps'

export const ZCreateSchema = z
	.object({
		orgId: z.string(),
		data: z.object({
			serviceName: z.string(),
			description: z.string().optional(),
			organizationId: z.string(),
			published: z.boolean().optional(),
		}),
	})
	.transform((parsedData) => {
		const { orgId, data } = parsedData
		const id = generateId('orgService')
		const serviceName = generateNestedFreeText({
			orgId,
			text: data.serviceName,
			type: 'svcName',
			itemId: id,
		})
		const description = data.description
			? generateNestedFreeText({ orgId, text: data.description, type: 'svcDesc', itemId: id })
			: undefined
		const organization = connectOneId(data.organizationId)
		const { published } = data

		const recordData = {
			id,
			serviceName,
			description,
			organization,
			published,
		}

		return Prisma.validator<Prisma.OrgServiceCreateArgs>()({ data: recordData })
	})

export type TCreateSchema = z.infer<typeof ZCreateSchema>
