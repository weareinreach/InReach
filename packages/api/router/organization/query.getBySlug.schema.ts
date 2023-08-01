import { z } from 'zod'

export const ZGetBySlugSchema = z.object({ slug: z.string() })
export type TGetBySlugSchema = z.infer<typeof ZGetBySlugSchema>
