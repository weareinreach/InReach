import { z } from 'zod'

export const ZKpiBoardRegionMappingCreateSchema = z.object({
	label: z.string().min(1),
	sortOrder: z.number().int().default(0),
	countryIds: z.array(z.string()).default([]),
	govDistIds: z.array(z.string()).default([]),
})

export type TKpiBoardRegionMappingCreateSchema = z.infer<typeof ZKpiBoardRegionMappingCreateSchema>
