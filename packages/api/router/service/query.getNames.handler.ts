import { TRPCError } from '@trpc/server'
import flush from 'just-flush'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNamesSchema } from './query.getNames.schema'

const getNames = async ({ input }: TRPCHandlerParams<TGetNamesSchema>) => {
	const { orgLocationId, organizationId } = input

	if (!orgLocationId && !organizationId) {
		throw new TRPCError({ code: 'BAD_REQUEST' })
	}

	const results = await prisma.orgService.findMany({
		where: {
			organizationId,
			...(orgLocationId
				? {
						locations: {
							some: { orgLocationId },
						},
					}
				: {}),
		},
		select: {
			id: true,
			serviceName: { select: { key: true, tsKey: { select: { text: true } } } },
		},
	})
	const transformedResults = flush(
		results.map(({ id, serviceName }) => {
			if (!serviceName) {
				return null
			}
			return { id, tsKey: serviceName.key, defaultText: serviceName.tsKey.text }
		})
	)
	return transformedResults
}
export default getNames
