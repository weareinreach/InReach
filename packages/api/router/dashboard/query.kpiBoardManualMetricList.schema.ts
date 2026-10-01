import { z } from 'zod'

import { ZKpiBoardManualMetricKey } from './mutation.kpiBoardManualMetricUpsert.schema'

export const ZKpiBoardManualMetricListSchema = z.object({
	metricKey: ZKpiBoardManualMetricKey.optional(),
})

export type TKpiBoardManualMetricListSchema = z.infer<typeof ZKpiBoardManualMetricListSchema>
