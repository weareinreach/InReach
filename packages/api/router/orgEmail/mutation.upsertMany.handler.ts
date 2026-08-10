import compact from 'just-compact'

import { buildContextUrl, syncDatabaseStringIfChanged } from '@weareinreach/crowdin/api'
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
		include: {
			services: true,
			locations: true,
			description: { select: { tsKey: { select: { text: true, crowdinId: true } } } },
		},
	})

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond. Precompute all per-item
	// data (including any Crowdin syncing) here, then use the results in a DB-only transaction below.
	const { slug } = await prisma.organization.findUniqueOrThrow({
		where: { id: orgId },
		select: { slug: true },
	})

	const preparedItems = await Promise.all(
		data.map(
			async ({
				title,
				services: servicesArr,
				locations: locationsArr,
				description,
				id: passedId,
				...record
			}) => {
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
					const crowdinId = await syncDatabaseStringIfChanged({
						key: descriptionText.upsert.create.tsKey.create.key,
						newText: descriptionText.upsert.create.tsKey.create.text,
						previousText: before?.description?.tsKey.text,
						previousCrowdinId: before?.description?.tsKey.crowdinId,
						context: buildContextUrl(slug),
					})
					if (crowdinId) {
						descriptionText.upsert.create.tsKey.create.crowdinId = crowdinId
					}
				}

				return { id, record, title, services, servicesBefore, locations, locationsBefore, descriptionText }
			}
		)
	)

	const results: Array<{ id: string }> = []

	const upserts = await prisma.$transaction(async (tx) => {
		for (const {
			id,
			record,
			title,
			services,
			servicesBefore,
			locations,
			locationsBefore,
			descriptionText,
		} of preparedItems) {
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
