import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TKpiBoardManualMetricListSchema } from './query.kpiBoardManualMetricList.schema'

const kpiBoardManualMetricList = async ({ input }: TRPCHandlerParams<TKpiBoardManualMetricListSchema>) =>
	prisma.dashboardManualMetric.findMany({
		where: input.metricKey ? { metricKey: input.metricKey } : undefined,
		orderBy: { periodStart: 'asc' },
	})

export default kpiBoardManualMetricList
