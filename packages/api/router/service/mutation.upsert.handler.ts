import { generateNestedFreeText, generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
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

	const result = await prisma.orgService.upsert({
		where: {
			id,
		},
		create: {
			id,
			deleted,
			published,
			...(input.services?.createdVals && {
				services: {
					createMany: { data: input.services.createdVals.map((tagId) => ({ tagId })), skipDuplicates: true },
				},
			}),
			...(input.name && {
				serviceName: generateNestedFreeText({
					orgId,
					itemId: id,
					type: 'svcName',
					text: input.name,
				}),
			}),
			...(input.description && {
				description: generateNestedFreeText({
					orgId,
					itemId: id,
					type: 'svcDesc',
					text: input.description,
				}),
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
			...(input.name && {
				serviceName: generateNestedFreeTextUpsert({
					orgId,
					itemId: id,
					type: 'svcName',
					text: input.name,
				}),
			}),
			...(input.description && {
				description: generateNestedFreeTextUpsert({
					orgId,
					itemId: id,
					type: 'svcDesc',
					text: input.description,
				}),
			}),
		},
	})

	return result
}
export default upsert
