import { z } from 'zod'

export const ZKpiBoardRegionMappingDeleteSchema = z.object({
	id: z.string(),
})

export type TKpiBoardRegionMappingDeleteSchema = z.infer<typeof ZKpiBoardRegionMappingDeleteSchema>
