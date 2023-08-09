import { type z } from 'zod'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import {
	type TCreateNewSuggestionSchema,
	ZCreateNewSuggestionSchema,
} from './mutation.createNewSuggestion.schema'

export const createNewSuggestion = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewSuggestionSchema, 'protected'>) => {
	const inputData = {
		actorId: ctx.session.user.id,
		operation: 'CREATE',
		data: input,
	} satisfies z.input<ReturnType<typeof ZCreateNewSuggestionSchema>['dataParser']>

	const record = ZCreateNewSuggestionSchema().dataParser.parse(inputData)
	const result = await prisma.suggestion.create(record)
	return result
}
