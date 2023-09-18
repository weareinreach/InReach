import { z } from 'zod'

import { type Prisma } from '@weareinreach/db'
import { CreateOneOrManyBase } from '~api/schemaBase/createOneOrMany'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZLinkEmailsSchema = () => {
	const { dataParser: parser, inputSchema } = CreateOneOrManyBase(
		z.object({
			orgEmailId: prefixedId('orgEmail'),
			serviceId: prefixedId('orgService'),
		})
	)

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
		const auditLog: Prisma.AuditLogUncheckedCreateInput[] = []
		const orgServiceEmail: Prisma.OrgServiceEmailUncheckedCreateInput[] = []

		if (Array.isArray(parsedData)) {
			for (const { orgEmailId, serviceId } of parsedData) {
				orgServiceEmail.push({ orgEmailId, serviceId })
				auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', orgEmailId, orgServiceId: serviceId }))
			}
		} else {
			const { orgEmailId, serviceId } = parsedData
			orgServiceEmail.push({ orgEmailId, serviceId })
			auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', orgEmailId, orgServiceId: serviceId }))
		}
		return { auditLog, orgServiceEmail }
	})
	return { dataParser, inputSchema }
}
export type TLinkEmailsSchema = z.infer<ReturnType<typeof ZLinkEmailsSchema>['inputSchema']>
