import { z } from 'zod'

export const ZGenerateSlugSchema = z.string()
export type TGenerateSlugSchema = z.infer<typeof ZGenerateSlugSchema>
