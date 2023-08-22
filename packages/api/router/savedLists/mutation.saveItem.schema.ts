import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { prefixedId } from '~api/schemas/idPrefix'
import { createManyRequired, createOneSeparateLog } from '~api/schemas/nestedOps'

export const ZSaveItemSchema = () => {
	const { dataParser: parser, inputSchema } = CreateBase(
		z.object({
			id: prefixedId('userSavedList'),
			organizationId: prefixedId('organization').optional(),
			serviceId: prefixedId('orgService').optional(),
		})
	)

	const dataParser = parser
		.extend({ ownedById: prefixedId('user') })
		.transform(({ actorId, ownedById, data }) => {
			const { id, organizationId, serviceId } = data
			const [organizations, orgLog] = createOneSeparateLog(
				organizationId ? { organizationId } : undefined,
				actorId
			)
			const [services, servLog] = createOneSeparateLog(serviceId ? { serviceId } : undefined, actorId)

			return Prisma.validator<Prisma.UserSavedListUpdateArgs>()({
				where: {
					id,
					ownedById,
				},
				data: {
					organizations,
					services,
					auditLogs: createManyRequired([orgLog, servLog]),
				},
				select: {
					services: { select: { serviceId: true } },
					organizations: { select: { organizationId: true } },
					id: true,
				},
			})
		})
	return { dataParser, inputSchema }
}
export type TSaveItemSchema = z.infer<ReturnType<typeof ZSaveItemSchema>['inputSchema']>
