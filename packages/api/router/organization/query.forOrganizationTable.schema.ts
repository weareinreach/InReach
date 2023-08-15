import { z } from 'zod'

export const ZForOrganizationTableSchema = z
	.object({
		published: z.boolean(),
		deleted: z.boolean(),
	})
	.partial()
	.optional()
export type TForOrganizationTableSchema = z.infer<typeof ZForOrganizationTableSchema>
