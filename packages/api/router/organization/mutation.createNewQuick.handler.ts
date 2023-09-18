import { type z } from 'zod'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewQuickSchema, ZCreateNewQuickSchema } from './mutation.createNewQuick.schema'

export const createNewQuick = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewQuickSchema, 'protected'>) => {
	const inputData = {
		actorId: ctx.session.user.id,
		operation: 'CREATE',
		data: input,
	} satisfies z.input<ReturnType<typeof ZCreateNewQuickSchema>['dataParser']>

	const record = ZCreateNewQuickSchema().dataParser.parse(inputData)

	const result = await prisma.organization.create(record)

	return result
}
