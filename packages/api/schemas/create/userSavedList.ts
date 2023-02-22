import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

import { CreationBase, idString } from '~api/schemas/common'
import { CreateAuditLog, GenerateAuditLog } from '~api/schemas/create/auditLog'

import { createMany, createOneSeparateLog } from '../nestedOps'

const CreateListSchema = z.object({ name: z.string() })
export const SaveItemSchema = z.object({
	id: idString,
	organizationId: idString.optional(),
	serviceId: idString.optional(),
})

const CreateAndSave = CreateListSchema.merge(SaveItemSchema.omit({ id: true }))

export const CreateSavedList = () => {
	const { dataParser: parser, inputSchema } = CreationBase(CreateListSchema)

	const dataParser = parser
		.extend({ ownedById: idString })
		.transform(({ actorId, operation, data, ownedById }) => {
			const { name } = data
			return Prisma.validator<Prisma.UserSavedListCreateArgs>()({
				data: {
					name,
					ownedById,
					auditLogs: CreateAuditLog({ actorId, operation, to: { name, ownedById } }),
				},
				select: {
					id: true,
					name: true,
				},
			})
		})

	return { dataParser, inputSchema }
}

export const CreateListAndEntry = () => {
	const { dataParser: parser, inputSchema: input } = CreationBase(CreateAndSave)
	const inputSchema = input.refine(
		(keys) => {
			if (keys.organizationId || keys.serviceId) return true
			else return false
		},
		{ message: 'Requires one of the following: organizationId, serviceId' }
	)

	const dataParser = parser
		.extend({ ownedById: idString })
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
					auditLogs: createMany([
						GenerateAuditLog({ actorId, operation, to: { name, ownedById } }),
						orgLog,
						servLog,
					]),
				},
				include: {
					services: true,
					organizations: true,
				},
			})
		})

	return { dataParser, inputSchema }
}
