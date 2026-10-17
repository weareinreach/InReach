import { z } from 'zod'

// Region filtering is deferred until KpiRegionMapping is migrated - see docs/Dashboards/KpiBoard/README.md.
export const ZKpiBoardMapMarkersSchema = z.object({
	search: z.string().optional(),
	serviceTagIds: z.array(z.string()).optional(),
	attributeIds: z.array(z.string()).optional(),
	status: z.enum(['good', 'needs_review', 'critical']).optional(),
})

export type TKpiBoardMapMarkersSchema = z.infer<typeof ZKpiBoardMapMarkersSchema>
