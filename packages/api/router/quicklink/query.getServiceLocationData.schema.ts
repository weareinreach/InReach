import { z } from 'zod'

export const ZGetServiceLocationDataSchema = z.object({ limit: z.number(), skip: z.number().optional() })
export type TGetServiceLocationDataSchema = z.infer<typeof ZGetServiceLocationDataSchema>
