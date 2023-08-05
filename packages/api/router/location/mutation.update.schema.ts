import { z } from 'zod'

export const ZUpdateSchema = z.literal('change me')
export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
