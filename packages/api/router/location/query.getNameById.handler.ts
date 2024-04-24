import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNameByIdSchema } from './query.getNameById.schema'

const getNameById = async ({ input }: TRPCHandlerParams<TGetNameByIdSchema>) => {
	const result = await prisma.orgLocation.findUniqueOrThrow({
		where: { id: input },
		select: { name: true },
	})
	return result
}
export default getNameById
