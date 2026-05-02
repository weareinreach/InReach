import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'dataPortalManager'>) => {
	const { id, ...data } = input

	const result = await prisma.report.update({
		where: { id },
		data: {
			...data,
			handledBy: {
				connect: { id: ctx.actorId },
			},
		},
	})

	return result
}

export default update
