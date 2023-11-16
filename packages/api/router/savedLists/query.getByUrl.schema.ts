import { z } from 'zod'

export const ZGetByUrlSchema = z.object({ slug: z.string() })
export type TGetByUrlSchema = z.infer<typeof ZGetByUrlSchema>
