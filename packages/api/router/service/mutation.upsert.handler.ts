import { upsertSingleKey } from '@weareinreach/crowdin/api'
import { generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpsertSchema } from './mutation.upsert.schema'

const upsert = async ({ ctx, input }: TRPCHandlerParams<TUpsertSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { generateId } = ctx

	const id = input.id ?? generateId('orgService')
	const { published, deleted, organizationId: orgId } = input

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
	const result = await prisma.$transaction(async (tx) => {
		if (serviceName) {
			const crowdin = await upsertSingleKey({
				isDatabaseString: true,
				key: serviceName.upsert.create.tsKey.create.key,
				text: serviceName.upsert.create.tsKey.create.text,
			})
			serviceName.upsert.create.tsKey.create.crowdinId = crowdin.id
		}
		if (description) {
			const crowdin = await upsertSingleKey({
				isDatabaseString: true,
				key: description.upsert.create.tsKey.create.key,
				text: description.upsert.create.tsKey.create.text,
			})
			description.upsert.create.tsKey.create.crowdinId = crowdin.id
		}

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
