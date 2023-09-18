import { z } from 'zod'

import { Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { GenerateAuditLog } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'
import { createManyRequired, createOneSeparateLog } from '~api/schemas/nestedOps'

export const ZCreateAndSaveItemSchema = () => {
	const { dataParser: parser, inputSchema: input } = CreateBase(
		z.object({
			name: z.string(),
			organizationId: prefixedId('organization').optional(),
			serviceId: prefixedId('orgService').optional(),
		})
	)
	const inputSchema = input.refine(
		(keys) => {
			if (keys.organizationId || keys.serviceId) return true
			else return false
		},
		{ message: 'Requires one of the following: organizationId, serviceId' }
	)

	const dataParser = parser
		.extend({ ownedById: prefixedId('user') })
		.transform(({ actorId, operation, data, ownedById }) => {
			const { name, organizationId, serviceId } = data

			const [organizations, orgLog] = createOneSeparateLog(
				organizationId ? { organizationId } : undefined,
				actorId
			)
			const [services, servLog] = createOneSeparateLog(serviceId ? { serviceId } : undefined, actorId)

			return Prisma.validator<Prisma.UserSavedListCreateArgs>()({
				data: {
					name,
					ownedById,
					organizations,
					services,
					auditLogs: createManyRequired([
						GenerateAuditLog({ actorId, operation, to: { name, ownedById } }),
						orgLog,
						servLog,
					]),
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
export type TCreateAndSaveItemSchema = z.infer<ReturnType<typeof ZCreateAndSaveItemSchema>['inputSchema']>
