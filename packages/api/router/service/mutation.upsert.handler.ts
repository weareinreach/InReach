import { buildContextUrl, syncDatabaseStringIfChanged } from '@weareinreach/crowdin/api'
import { generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpsertSchema } from './mutation.upsert.schema'

const upsert = async ({ ctx, input }: TRPCHandlerParams<TUpsertSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { generateId } = ctx

	const id = input.id ?? generateId('orgService')
	const { published, deleted, organizationId: orgId, attachToLocation } = input

	const hasServiceUpdates = Boolean(
		input.services?.createdVals?.length ?? input.services?.deletedVals?.length
	)
	const serviceName = input.name
		? generateNestedFreeTextUpsert({
				orgId,
				itemId: id,
				type: 'svcName',
				text: input.name,
			})
		: undefined
	const description = input.description
		? generateNestedFreeTextUpsert({
				orgId,
				itemId: id,
				type: 'svcDesc',
				text: input.description,
			})
		: undefined
	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond.
	const { slug } = await prisma.organization.findUniqueOrThrow({
		where: { id: orgId },
		select: { slug: true },
	})
	const existing = input.id
		? await prisma.orgService.findUnique({
				where: { id: input.id },
				select: {
					serviceName: { select: { tsKey: { select: { text: true, crowdinId: true } } } },
					description: { select: { tsKey: { select: { text: true, crowdinId: true } } } },
				},
			})
		: null
	if (serviceName) {
		const crowdinId = await syncDatabaseStringIfChanged({
			key: serviceName.upsert.create.tsKey.create.key,
			newText: serviceName.upsert.create.tsKey.create.text,
			previousText: existing?.serviceName?.tsKey.text,
			previousCrowdinId: existing?.serviceName?.tsKey.crowdinId,
			context: buildContextUrl(slug, attachToLocation),
		})
		if (crowdinId) {
			serviceName.upsert.create.tsKey.create.crowdinId = crowdinId
		}
	}
	if (description) {
		const crowdinId = await syncDatabaseStringIfChanged({
			key: description.upsert.create.tsKey.create.key,
			newText: description.upsert.create.tsKey.create.text,
			previousText: existing?.description?.tsKey.text,
			previousCrowdinId: existing?.description?.tsKey.crowdinId,
			context: buildContextUrl(slug, attachToLocation),
		})
		if (crowdinId) {
			description.upsert.create.tsKey.create.crowdinId = crowdinId
		}
	}

	const result = await prisma.$transaction(async (tx) => {
		const upsertedRecord = await tx.orgService.upsert({
			where: {
				id,
			},
			create: {
				id,
				deleted,
				published,
				organization: { connect: { id: orgId } },
				...(input.services?.createdVals && {
					services: {
						createMany: {
							data: input.services.createdVals.map((tagId) => ({ tagId })),
							skipDuplicates: true,
						},
					},
				}),
				...(serviceName && { serviceName: { create: serviceName.upsert.create } }),
				...(description && { description: { create: description.upsert.create } }),
				...(attachToLocation && {
					locations: { create: { location: { connect: { id: attachToLocation } } } },
				}),
			},
			update: {
				published,
				deleted,
				...(hasServiceUpdates && {
					services: {
						...(input.services?.deletedVals && {
							deleteMany: { tagId: { in: input.services.deletedVals } },
						}),
						...(input.services?.createdVals && {
							createMany: {
								data: input.services.createdVals.map((tagId) => ({ tagId })),
								skipDuplicates: true,
							},
						}),
					},
				}),
				...(serviceName && { serviceName }),
				...(description && { description }),
			},
		})

		return upsertedRecord
	})
	return result
}
export default upsert
