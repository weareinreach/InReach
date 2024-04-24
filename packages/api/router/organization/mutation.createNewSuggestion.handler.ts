import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewSuggestionSchema } from './mutation.createNewSuggestion.schema'

const createNewSuggestion = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewSuggestionSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const result = await prisma.suggestion.create(input)
	return result
}
export default createNewSuggestion
