import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForEditDrawerSchema } from './query.forEditDrawer.schema'

export const forEditDrawer = async ({ input }: TRPCHandlerParams<TForEditDrawerSchema>) => {
	try {
		const result = await prisma.orgPhone.findUniqueOrThrow({
			where: input,
			include: {
				description: { include: { tsKey: true } },
			},
		})
		const reformatted = {
			...result,
			description: result.description?.tsKey?.text,
		}
		return reformatted
	} catch (error) {
		handleError(error)
	}
}
