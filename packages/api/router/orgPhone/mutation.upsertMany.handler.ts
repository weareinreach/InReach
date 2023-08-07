import compact from 'just-compact'

import { generateNestedFreeText, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import {
	connectOneId,
	connectOneIdRequired,
	connectOrDisconnectId,
	createManyOptional,
	diffConnectionsMtoN,
} from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpsertManySchema } from './mutation.upsertMany.schema'

export const upsertMany = async ({ ctx, input }: TRPCHandlerParams<TUpsertManySchema, 'protected'>) => {
	try {
		const { orgId, data } = input

		const existing = await prisma.orgPhone.findMany({
			where: {
				id: { in: compact(data.map(({ id }) => id)) },
			},
			include: { services: true, locations: true },
		})
		const upserts = await prisma.$transaction(
			data.map(
				({
					phoneType,
					country,
					services: servicesArr,
					locations: locationsArr,
					description,
					id: passedId,
					...record
				}) => {
					const before = passedId ? existing.find(({ id }) => id === passedId) : undefined
					const servicesBefore = before?.services.map(({ serviceId }) => ({ serviceId })) ?? []
					const locationsBefore = before?.locations.map(({ orgLocationId }) => ({ orgLocationId })) ?? []
					const auditLogs = CreateAuditLog({
						actorId: ctx.actorId,
						operation: before ? 'UPDATE' : 'CREATE',
						from: before,
						to: record,
					})
					const id = passedId ?? ctx.generateId('orgPhone')

					const services = servicesArr.map((serviceId) => ({ serviceId }))
					const locations = locationsArr.map((orgLocationId) => ({ orgLocationId }))

					return prisma.orgPhone.upsert({
						where: { id },
						create: {
							id,
							...record,
							country: connectOneIdRequired(country.id),
							phoneType: connectOneId(phoneType),
							services: createManyOptional(services),
							locations: createManyOptional(locations),
							auditLogs,
							description: description
								? generateNestedFreeText({ orgId, text: description, type: 'phoneDesc', itemId: id })
								: undefined,
						},
						update: {
							id,
							...record,
							country: connectOneIdRequired(country.id),
							phoneType: connectOrDisconnectId(phoneType),
							services: diffConnectionsMtoN(services, servicesBefore, 'serviceId'),
							locations: diffConnectionsMtoN(locations, locationsBefore, 'orgLocationId'),
							description: description
								? {
										upsert: {
											...generateNestedFreeText({
												orgId,
												text: description,
												type: 'phoneDesc',
												itemId: id,
											}),
											update: { tsKey: { update: { text: description } } },
										},
								  }
								: undefined,
							auditLogs,
						},
					})
				}
			)
		)
		return upserts
	} catch (error) {
		handleError(error)
	}
}
