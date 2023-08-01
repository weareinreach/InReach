import { z } from 'zod'

export const ZGetByIdSchema = z.object({ id: z.string() })
export type TGetByIdSchema = z.infer<typeof ZGetByIdSchema>
