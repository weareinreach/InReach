import { z } from 'zod'

// Whitelisted keys for the KPI Board's manually-entered metrics (Impact tab) - the model itself
// (`DashboardManualMetric`) stores metricKey as a plain string so new keys can be added here
// without a schema migration. See docs/Dashboards/KpiBoard/README.md.
export const ZKpiBoardManualMetricKey = z.enum(['donations-monthly-total', 'grants-monthly-total'])

export const ZKpiBoardManualMetricUpsertSchema = z.object({
	metricKey: ZKpiBoardManualMetricKey,
	periodStart: z.date(),
	value: z.number().int(),
	breakdown: z.record(z.string(), z.number()).optional(),
	note: z.string().optional(),
})

export type TKpiBoardManualMetricUpsertSchema = z.infer<typeof ZKpiBoardManualMetricUpsertSchema>
