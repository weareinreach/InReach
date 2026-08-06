import { addSingleKeyFromNestedFreetextCreate, buildContextUrl } from '@weareinreach/crowdin/api'
import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewQuickSchema } from './mutation.createNewQuick.schema'

const createNewQuick = async ({ ctx, input }: TRPCHandlerParams<TCreateNewQuickSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond.
	if (input.data.description) {
		const { id: crowdinId } = await addSingleKeyFromNestedFreetextCreate(
			input.data.description,
			buildContextUrl(input.data.slug)
		)
		input.data.description.create.tsKey.create.crowdinId = crowdinId
	}

	const batchedResult = await prisma.$transaction(async (tx) => {
		const result = await tx.organization.create(input)

		return result
	})
	return batchedResult
}
export default createNewQuick
