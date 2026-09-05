import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TBulkAttachTagsSchema } from './mutation.bulkAttachTags.schema'

/**
 * Bulk sibling of `attachServiceTags` - same `orgServiceTag.createMany({ skipDuplicates: true })` write (the
 * composite `(serviceId, tagId)` primary key means Postgres itself prevents double-attaching, so
 * `skipDuplicates` is a real guarantee here, unlike the attribute case). Deliberately its own procedure with
 * its own `dataPortalManager` gate - never reusing `attachServiceTags`' own (lower-tier) permission, even
 * though the write is identical.
 */
const bulkAttachTags = async ({ ctx, input }: TRPCHandlerParams<TBulkAttachTagsSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const result = await prisma.orgServiceTag.createMany({
		data: input.serviceIds.map((serviceId) => ({ serviceId, tagId: input.tagId })),
		skipDuplicates: true,
	})
	return { added: result.count, alreadyHad: input.serviceIds.length - result.count }
}
export default bulkAttachTags
