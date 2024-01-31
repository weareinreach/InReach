import filterObj from 'just-filter-object'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const map = async ({ ctx: _ }: TRPCHandlerParams<undefined>) => {
	try {
		const result = await prisma.attribute.findMany({
			where: {
				active: true,
			},
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
				icon: true,
				iconBg: true,
			},
		})
		if (!result) return null
		const mapped = new Map<string, MapValue>(
			result.map(({ id, ...rest }) => [id, filterObj(rest, (_key, value) => Boolean(value)) as MapValue])
		)
		return mapped
	} catch (error) {
		handleError(error)
	}
}

type MapValue = {
	tsKey: string
	tsNs: string
	icon?: string
	iconBg?: string
}

export default map
