import { z } from 'zod'

export const ZCreateSchema = z.object({ name: z.string() })
export type TCreateSchema = z.infer<typeof ZCreateSchema>
