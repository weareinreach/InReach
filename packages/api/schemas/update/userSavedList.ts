import { z } from 'zod'
import { Prisma } from '@weareinreach/db'

import { CreationBase, idString } from '../common'
import { SaveItemSchema } from '../create/userSavedList'
import { createOneSeparateLog, createMany, deleteOneSeparateLog } from '../nestedOps'

export const SaveItem = () => {
	const { dataParser: parser, inputSchema } = CreationBase(z.object(SaveItemSchema))

	const dataParser = parser.extend({ ownedById: idString }).transform(({ actorId, ownedById, data }) => {
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
				auditLogs: createMany([orgLog, servLog]),
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

export const DeleteSavedItem = () => {
	const { dataParser: parser, inputSchema } = CreationBase(z.object(SaveItemSchema))

	const dataParser = parser.extend({ ownedById: idString }).transform(({ actorId, ownedById, data }) => {
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
				auditLogs: createMany([orgLog, servLog]),
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

export const ShareListUrl = () => {}
