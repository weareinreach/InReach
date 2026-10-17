import { z } from 'zod'

export const ZKpiBoardRegionMappingListSchema = z.void()

export type TKpiBoardRegionMappingListSchema = z.infer<typeof ZKpiBoardRegionMappingListSchema>
