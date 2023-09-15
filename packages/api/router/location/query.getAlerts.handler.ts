import compact from 'just-compact'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAlertsSchema } from './query.getAlerts.schema'

export const getAlerts = async ({ input }: TRPCHandlerParams<TGetAlertsSchema>) => {
	try {
		const dbResult = await prisma.locationAttribute.findMany({
			where: {
				location: { id: input.id },
				attribute: { active: true, categories: { some: { category: { active: true, tag: 'alerts' } } } },
				active: true,
				supplement: { some: {} },
			},
			select: {
				supplement: {
					select: { text: { select: { tsKey: { select: { key: true, ns: true, text: true } } } } },
				},
				attribute: { select: { tag: true, icon: true } },
			},
		})
		const reformatted = compact(
			dbResult.flatMap(({ supplement, attribute }) => {
				return supplement.map(({ text }) => {
					if (!text?.tsKey) return
					return { ...text.tsKey, ...attribute }
				})
			})
		)
		return reformatted
	} catch (error) {
		handleError(error)
	}
}
