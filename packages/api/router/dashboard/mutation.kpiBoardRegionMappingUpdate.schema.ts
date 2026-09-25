import { z } from 'zod'

export const ZKpiBoardRegionMappingUpdateSchema = z.object({
	id: z.string(),
	label: z.string().min(1).optional(),
	sortOrder: z.number().int().optional(),
	countryIds: z.array(z.string()).optional(),
	govDistIds: z.array(z.string()).optional(),
})

export type TKpiBoardRegionMappingUpdateSchema = z.infer<typeof ZKpiBoardRegionMappingUpdateSchema>
