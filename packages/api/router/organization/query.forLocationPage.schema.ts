import { z } from 'zod'

export const ZForLocationPageSchema = z.object({ slug: z.string() })
export type TForLocationPageSchema = z.infer<typeof ZForLocationPageSchema>
