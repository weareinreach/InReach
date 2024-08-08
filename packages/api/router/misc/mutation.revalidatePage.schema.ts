import { z } from 'zod'

export const ZRevalidatePageSchema = z.object({ path: z.string() })
export type TRevalidatePageSchema = z.infer<typeof ZRevalidatePageSchema>
