import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForEditDrawerSchema } from './query.forEditDrawer.schema'

export const forEditDrawer = async ({ input }: TRPCHandlerParams<TForEditDrawerSchema>) => {
	try {
		const result = await prisma.orgPhone.findUniqueOrThrow({
			where: input,
			select: {
				id: true,
				number: true,
				ext: true,
				primary: true,
				published: true,
				deleted: true,
				country: { select: { id: true, cca2: true } },
				phoneType: { select: { id: true, type: true } },
				description: { select: { id: true, key: true, tsKey: { select: { text: true } } } },
				locationOnly: true,
				serviceOnly: true,
			},
		})
		const reformatted = {
			...result,
			description: result.description
				? { id: result.description?.id, key: result.description?.key, text: result.description?.tsKey?.text }
				: null,
		}
		return reformatted
	} catch (error) {
		handleError(error)
	}
}
