import { type z } from 'zod'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewQuickSchema, ZCreateNewQuickSchema } from './mutation.createNewQuick.schema'

export const createNewQuick = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewQuickSchema, 'protected'>) => {
	try {
		const inputData = {
			actorId: ctx.session.user.id,
			operation: 'CREATE',
			data: input,
		} satisfies z.input<ReturnType<typeof ZCreateNewQuickSchema>['dataParser']>

		const record = ZCreateNewQuickSchema().dataParser.parse(inputData)

		const result = await prisma.organization.create(record)

		return result
	} catch (error) {
		handleError(error)
	}
}
