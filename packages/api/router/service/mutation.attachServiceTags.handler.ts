import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TAttachServiceTagsSchema } from './mutation.attachServiceTags.schema'

const attachServiceTags = async ({
	ctx,
	input,
}: TRPCHandlerParams<TAttachServiceTagsSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const tags = await prisma.orgServiceTag.createMany({
		data: input,
		skipDuplicates: true,
	})
	return tags
}
export default attachServiceTags
