import { z } from 'zod'

export const ZAttributeCategoriesSchema = z.string().array().optional()
export type TAttributeCategoriesSchema = z.infer<typeof ZAttributeCategoriesSchema>
