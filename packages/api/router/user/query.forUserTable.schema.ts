import { z } from 'zod'

export const ZForUserTableSchema = z
	.object({
		active: z.boolean().default(true),
	})
	.partial()
	.optional()
export type TForUserTableSchema = z.infer<typeof ZForUserTableSchema>
