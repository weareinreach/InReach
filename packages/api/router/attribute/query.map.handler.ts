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
				tag: true,
				requireBoolean: true,
				requireData: true,
				requireDataSchema: true,
				requireGeo: true,
				requireLanguage: true,
				requireText: true,
			},
		})
		if (!result) return null
		const byId = new Map<string, MapById>(
			result.map(({ id, ...rest }) => [id, filterObj(rest, (_key, value) => value !== null) as MapById])
		)
		const byTag = new Map<string, MapByTag>(
			result.map(({ tag, ...rest }) => [tag, filterObj(rest, (_key, value) => value !== null) as MapByTag])
		)
		return { byId, byTag }
	} catch (error) {
		handleError(error)
	}
}

interface MapValueBase {
	tsKey: string
	tsNs: string
	icon?: string
	iconBg?: string
	requireBoolean: boolean
	requireData: boolean
	requireDataSchema: object
	requireGeo: boolean
	requireLanguage: boolean
	requireText: boolean
}

interface MapById extends MapValueBase {
	tag: string
}
interface MapByTag extends MapValueBase {
	id: string
}

export default map
