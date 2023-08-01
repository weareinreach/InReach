import { z } from 'zod'

export const ZSearchNameSchema = z.object({ search: z.string() })
export type TSearchNameSchema = z.infer<typeof ZSearchNameSchema>
