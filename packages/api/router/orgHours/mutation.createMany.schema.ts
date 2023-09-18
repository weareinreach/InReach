import { type z } from 'zod'

import { generateId, type Prisma } from '@weareinreach/db'
import { CreateManyBase } from '~api/schemaBase/createMany'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'

import { ZCreateSchema } from './mutation.create.schema'

export const ZCreateManySchema = () => {
	const { dataParser: parser, inputSchema } = CreateManyBase(ZCreateSchema.array())
	const dataParser = parser.transform(({ actorId, operation, data: parsedData }) => {
		const orgHours: Prisma.OrgHoursCreateManyInput[] = []
		const auditLogs: Prisma.AuditLogCreateManyInput[] = []
		for (const item of parsedData) {
			const id = generateId('orgHours')
			const audit = GenerateAuditLog({ actorId, operation, to: item, orgHoursId: id })
			orgHours.push({ id, ...item })
			auditLogs.push(audit)
		}
		return {
			orgHours: { data: orgHours, skipDuplicates: true },
			auditLogs: { data: auditLogs, skipDuplicates: true },
		}
	})
	return { dataParser, inputSchema }
}
export type TCreateManySchema = z.infer<ReturnType<typeof ZCreateManySchema>['inputSchema']>
