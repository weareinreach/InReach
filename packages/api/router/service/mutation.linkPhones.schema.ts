import { z } from 'zod'

import { type Prisma } from '@weareinreach/db'
import { CreateOneOrManyBase } from '~api/schemaBase/createOneOrMany'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'

export const ZLinkPhonesSchema = () => {
	const { dataParser: parser, inputSchema } = CreateOneOrManyBase(
		z.object({
			orgPhoneId: prefixedId('orgPhone'),
			serviceId: prefixedId('orgService'),
		})
	)

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
		const auditLog: Prisma.AuditLogUncheckedCreateInput[] = []
		const orgServicePhone: Prisma.OrgServicePhoneUncheckedCreateInput[] = []

		if (Array.isArray(parsedData)) {
			for (const { orgPhoneId, serviceId } of parsedData) {
				orgServicePhone.push({ orgPhoneId, serviceId })
				auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', orgPhoneId, orgServiceId: serviceId }))
			}
		} else {
			const { orgPhoneId, serviceId } = parsedData
			orgServicePhone.push({ orgPhoneId, serviceId })
			auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', orgPhoneId, orgServiceId: serviceId }))
		}
		return { auditLog, orgServicePhone }
	})
	return { dataParser, inputSchema }
}
export type TLinkPhonesSchema = z.infer<ReturnType<typeof ZLinkPhonesSchema>['inputSchema']>
