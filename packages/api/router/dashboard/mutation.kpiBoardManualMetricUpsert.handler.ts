import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TKpiBoardManualMetricUpsertSchema } from './mutation.kpiBoardManualMetricUpsert.schema'

const kpiBoardManualMetricUpsert = async ({
	ctx,
	input,
}: TRPCHandlerParams<TKpiBoardManualMetricUpsertSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { metricKey, periodStart, ...rest } = input
	return prisma.dashboardManualMetric.upsert({
		where: { metricKey_periodStart: { metricKey, periodStart } },
		create: { metricKey, periodStart, ...rest, enteredById: ctx.actorId },
		update: { ...rest, enteredById: ctx.actorId },
	})
}

export default kpiBoardManualMetricUpsert
