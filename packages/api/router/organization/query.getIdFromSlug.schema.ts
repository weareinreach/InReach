import { z } from 'zod'

export const ZGetIdFromSlugSchema = z.object({ slug: z.string() })
export type TGetIdFromSlugSchema = z.infer<typeof ZGetIdFromSlugSchema>
