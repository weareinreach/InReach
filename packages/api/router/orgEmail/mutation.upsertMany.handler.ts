import compact from 'just-compact'

import { upsertSingleKey } from '@weareinreach/crowdin/api'
import { generateId, generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
import {
	connectOneId,
	connectOrDisconnectId,
	createManyOptional,
	diffConnectionsMtoN,
} from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpsertManySchema } from './mutation.upsertMany.schema'

const upsertMany = async ({ ctx, input }: TRPCHandlerParams<TUpsertManySchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { orgId, data } = input

	const existing = await prisma.orgEmail.findMany({
		where: {
			id: { in: compact(data.map(({ id }) => id)) },
		},
		include: { services: true, locations: true },
	})

	const results: Array<{ id: string }> = []

	const upserts = await prisma.$transaction(async (tx) => {
		for (const {
			title,
			services: servicesArr,
			locations: locationsArr,
			description,
			id: passedId,
			...record
		} of data) {
			const before = passedId ? existing.find(({ id: existingId }) => existingId === passedId) : undefined
			const servicesBefore = before?.services?.map(({ serviceId }) => ({ serviceId })) ?? []
			const locationsBefore = before?.locations?.map(({ orgLocationId }) => ({ orgLocationId })) ?? []
			const id = passedId ?? ctx.generateId('orgEmail')

			const services = servicesArr.map((serviceId) => ({ serviceId }))
			const locations = locationsArr.map((orgLocationId) => ({ orgLocationId }))

			const descriptionText = description
				? generateNestedFreeTextUpsert({
						orgId,
						text: description,
						type: 'emailDesc',
						itemId: id,
						freeTextId: generateId('freeText'),
					})
				: undefined

			if (descriptionText) {
				const crowdin = await upsertSingleKey({
					isDatabaseString: true,
					key: descriptionText.upsert.create.tsKey.create.key,
					text: descriptionText.upsert.create.tsKey.create.text,
				})
				if (crowdin.id) {
					descriptionText.upsert.create.tsKey.create.crowdinId = crowdin.id
				}
			}

			const txnResult = await tx.orgEmail.upsert({
				where: { id },
				create: {
					id,
					...record,
					title: connectOneId(title),
					services: createManyOptional(services),
					locations: createManyOptional(locations),
					description: descriptionText?.upsert,
				},
				update: {
					id,
					...record,
					title: connectOrDisconnectId(title),
					services: diffConnectionsMtoN(services, servicesBefore, 'serviceId'),
					locations: diffConnectionsMtoN(locations, locationsBefore, 'orgLocationId'),
					description: descriptionText,
				},
				select: { id: true },
			})
			results.push(txnResult)
		}
		return results
	})
	return upserts
}
export default upsertMany
