import { z } from 'zod'

export const ZGetEmailDataSchema = z.object({ limit: z.number(), skip: z.number().optional() })
export type TGetEmailDataSchema = z.infer<typeof ZGetEmailDataSchema>
