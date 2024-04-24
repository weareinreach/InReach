import { Interval } from 'luxon'

import { getAuditedClient } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TProcessDrawerSchema } from './mutation.processDrawer.schema'

export const processDrawer = async ({ input, ctx }: TRPCHandlerParams<TProcessDrawerSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	try {
		const results = {
			created: 0,
			updated: 0,
			deleted: 0,
		}
		if (input.createdVals) {
			const prepped = input.createdVals.map(({ interval, ...rest }) => {
				const { start, end } = Interval.fromISO(interval)
				if (!start || !end) {
					throw new Error('Invalid interval', { cause: interval })
				}
				return {
					...rest,
					start: start.toJSDate(),
					end: end.toJSDate(),
				}
			})

			const created = await prisma.orgHours.createMany({ data: prepped, skipDuplicates: true })
			results.created = created.count
		}
		if (input.updatedVals) {
			const prepped = input.updatedVals.map(({ interval, id, ...rest }) => {
				const { start, end } = Interval.fromISO(interval)
				if (!start || !end) {
					throw new Error('Invalid interval', { cause: interval })
				}
				return {
					where: { id },
					data: {
						...rest,
						start: start.toJSDate(),
						end: end.toJSDate(),
					},
				}
			})
			const updated = await prisma.$transaction(prepped.map((args) => prisma.orgHours.update(args)))
			results.updated = updated.length
		}
		if (input.deletedVals) {
			const deleted = await prisma.orgHours.deleteMany({
				where: { id: { in: input.deletedVals.map(({ id }) => id) } },
			})
			results.deleted = deleted.count
		}
		return results
	} catch (error) {
		return handleError(error)
	}
}
export default processDrawer
