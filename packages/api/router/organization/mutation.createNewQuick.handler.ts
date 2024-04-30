import { addSingleKeyFromNestedFreetextCreate } from '@weareinreach/crowdin/api'
import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewQuickSchema } from './mutation.createNewQuick.schema'

const createNewQuick = async ({ ctx, input }: TRPCHandlerParams<TCreateNewQuickSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const batchedResult = await prisma.$transaction(async (tx) => {
		if (input.data.description) {
			const { id: crowdinId } = await addSingleKeyFromNestedFreetextCreate(input.data.description)
			input.data.description.create.tsKey.create.crowdinId = crowdinId
		}
		const result = await tx.organization.create(input)

		return result
	})
	return batchedResult
}
export default createNewQuick
