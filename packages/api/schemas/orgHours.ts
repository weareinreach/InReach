import { Prisma, generateId } from '@weareinreach/db'
import { DateTime } from 'luxon'
import { z } from 'zod'

import { CreationManyBase } from './common'
import { GenerateAuditLog } from './create/auditLog'

const CreateOrgHoursBase = z.object({
	/** Sun 0, Mon 1, Tue 2, Wed 3, Thu 3, Fri 4, Sat 6 */
	dayIndex: z.number().gte(0).lte(6),
	start: z.coerce.date(),
	end: z.coerce.date(),
	tz: z
		.string()
		.refine((val) => DateTime.now().setZone(val).isValid)
		.optional(),
	orgLocId: z.string().optional(),
	orgServiceId: z.string().optional(),
	organizationId: z.string().optional(),
	closed: z.boolean(),
})

export const CreateOrgHoursSchema = CreateOrgHoursBase.transform((data) =>
	Prisma.validator<Prisma.OrgHoursUncheckedCreateInput>()(data)
)
export const CreateManyOrgHours = () => {
	const { dataParser: parser, inputSchema } = CreationManyBase(CreateOrgHoursBase.array())
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

export const UpdateOrgHoursSchema = z
	.object({
		id: z.string(),
		data: z
			.object({
				/** Sun 0, Mon 1, Tue 2, Wed 3, Thu 3, Fri 4, Sat 6 */
				dayIndex: z.number().gte(0).lte(6),
				start: z.coerce.date(),
				end: z.coerce.date(),
				tz: z.string().refine((val) => DateTime.now().setZone(val).isValid),
				orgLocId: z.string(),
				orgServiceId: z.string(),
				organizationId: z.string(),
				closed: z.boolean(),
			})
			.partial(),
	})
	.transform(({ data, id }) => Prisma.validator<Prisma.OrgHoursUpdateArgs>()({ where: { id }, data }))
