import { z } from 'zod'

import { generateId, generateNestedFreeText, Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { connectOneId } from '~api/schemas/nestedOps'

export const ZCreateSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(
		z.object({
			orgId: z.string(),
			data: z.object({
				serviceName: z.string(),
				description: z.string().optional(),
				organizationId: z.string(),
				published: z.boolean().optional(),
			}),
		})
	)

	const dataParser = parser.transform(({ data: parsedData, actorId, operation }) => {
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
		const auditLogs = CreateAuditLog({ actorId, operation, to: recordData })

		return Prisma.validator<Prisma.OrgServiceCreateArgs>()({ data: { ...recordData, auditLogs } })
	})
	return { dataParser, inputSchema }
}
export type TCreateSchema = z.infer<ReturnType<typeof ZCreateSchema>['inputSchema']>
