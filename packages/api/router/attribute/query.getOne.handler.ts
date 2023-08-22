import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetOneSchema } from './query.getOne.schema'

export const getOne = async ({ input }: TRPCHandlerParams<TGetOneSchema>) => {
	const result = await prisma.attribute.findUniqueOrThrow({
		where: input,
		select: {
			id: true,
			tag: true,
			tsKey: true,
			tsNs: true,
			icon: true,
			iconBg: true,
			active: true,
			requireBoolean: true,
			requireData: true,
			requireDataSchema: { select: { definition: true } },
			requireGeo: true,
			requireLanguage: true,
			requireText: true,
		},
	})
	return result
}
