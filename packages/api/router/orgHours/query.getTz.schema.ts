import { z } from 'zod'

export const ZGetTzSchema = z.object({ lat: z.number().gte(-90).lte(90), lon: z.number().gte(-180).lte(180) })
export type TGetTzSchema = z.infer<typeof ZGetTzSchema>
