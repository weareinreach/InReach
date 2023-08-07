import { z } from 'zod'

export const ZAttributesByCategorySchema = z
	.string()
	.or(z.string().array())
	.optional()
	.describe('categoryName')
export type TAttributesByCategorySchema = z.infer<typeof ZAttributesByCategorySchema>
