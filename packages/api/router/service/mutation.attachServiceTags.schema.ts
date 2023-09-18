import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { CreateManyBase } from '~api/schemaBase/createMany'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'

export const ZAttachServiceTagsSchema = () => {
	const { dataParser: parser, inputSchema } = CreateManyBase(
		z
			.object({
				serviceId: z.string(),
				tagId: z.string(),
			})
			.array()
	)

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
		const auditLogs = parsedData.map(({ serviceId, tagId }) =>
			GenerateAuditLog({ actorId, operation: 'LINK', orgServiceId: serviceId, serviceTagId: tagId })
		)
		return {
			orgServiceTag: Prisma.validator<Prisma.OrgServiceTagCreateManyArgs>()({
				data: parsedData,
				skipDuplicates: true,
			}),
			auditLogs: Prisma.validator<Prisma.AuditLogCreateManyArgs>()({ data: auditLogs, skipDuplicates: true }),
		}
	})
	return { dataParser, inputSchema }
}
export type TAttachServiceTagsSchema = z.infer<ReturnType<typeof ZAttachServiceTagsSchema>['inputSchema']>
