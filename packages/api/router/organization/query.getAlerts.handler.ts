import compact from 'just-compact'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAlertsSchema } from './query.getAlerts.schema'

const getAlerts = async ({ input }: TRPCHandlerParams<TGetAlertsSchema>) => {
	try {
		const { id, slug } = input
		const dbResult = await prisma.attributeSupplement.findMany({
			where: {
				organization: { id, slug },
				attribute: { active: true, categories: { some: { category: { active: true, tag: 'alerts' } } } },
				active: true,
			},
			select: {
				text: { select: { tsKey: { select: { key: true, ns: true, text: true } } } },
				attribute: { select: { tag: true, icon: true } },
			},
		})
		const reformatted = compact(
			dbResult.flatMap(({ text, attribute }) => {
				// An alert with no text has nothing to show - skip it, same as location.getAlerts. Spreading a
				// missing tsKey left `{ tag, icon }` with no key/text, which `compact` keeps (#2076).
				if (!text?.tsKey) {
					return null
				}
				return { ...text.tsKey, ...attribute }
			})
		)
		return reformatted
	} catch (error) {
		return handleError(error)
	}
}
export default getAlerts
