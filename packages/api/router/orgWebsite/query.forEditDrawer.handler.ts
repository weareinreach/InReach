import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForEditDrawerSchema } from './query.forEditDrawer.schema'

const forEditDrawer = async ({ input }: TRPCHandlerParams<TForEditDrawerSchema>) => {
	const result = await prisma.orgWebsite.findUnique({
		where: input,
		include: {
			description: { include: { tsKey: true } },
		},
	})
	if (!result) {
		return null
	}
	const reformatted = {
		...result,
		description: result.description?.tsKey?.text,
	}
	return reformatted
}
export default forEditDrawer
