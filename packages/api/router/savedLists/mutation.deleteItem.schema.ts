import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { prefixedId } from '~api/schemas/idPrefix'
import { createManyRequired, deleteOneSeparateLog } from '~api/schemas/nestedOps'

export const ZDeleteItemSchema = () => {
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
			const [organizations, orgLog] = deleteOneSeparateLog(
				organizationId
					? {
							listId_organizationId: {
								listId: id,
								organizationId,
							},
					  }
					: undefined,
				actorId
			)
			const [services, servLog] = deleteOneSeparateLog(
				serviceId
					? {
							listId_serviceId: {
								listId: id,
								serviceId,
							},
					  }
					: undefined,
				actorId
			)

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
					id: true,
					name: true,
					organizations: {
						select: { organizationId: true },
					},
					services: {
						select: { serviceId: true },
					},
				},
			})
		})
	return { dataParser, inputSchema }
}
export type TDeleteItemSchema = z.infer<ReturnType<typeof ZDeleteItemSchema>['inputSchema']>
