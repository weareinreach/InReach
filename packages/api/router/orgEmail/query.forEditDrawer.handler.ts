import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForEditDrawerSchema } from './query.forEditDrawer.schema'

export const forEditDrawer = async ({ input }: TRPCHandlerParams<TForEditDrawerSchema>) => {
	try {
		const result = await prisma.orgEmail.findUnique({
			where: input,
			select: {
				id: true,
				deleted: true,
				description: { select: { tsKey: { select: { text: true, key: true, ns: true } } } },
				descriptionId: true,
				email: true,
				firstName: true,
				lastName: true,
				locationOnly: true,
				primary: true,
				published: true,
				serviceOnly: true,
				titleId: true,
			},
		})
		if (!result) {
			return null
		}
		const { description, ...rest } = result

		const reformatted = {
			...rest,
			description: description ? description.tsKey.text : null,
		}

		return reformatted
	} catch (error) {
		return handleError(error)
	}
}
export default forEditDrawer
