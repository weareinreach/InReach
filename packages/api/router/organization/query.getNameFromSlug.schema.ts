import { z } from 'zod'

export const ZGetNameFromSlugSchema = z.string()
export type TGetNameFromSlugSchema = z.infer<typeof ZGetNameFromSlugSchema>
