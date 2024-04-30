import { z } from 'zod'

export const ZCreateSchema = z.object({
	orgId: z.string(),
	data: z.object({
		serviceName: z.string(),
		description: z.string().optional(),
		organizationId: z.string(),
		published: z.boolean().optional(),
	}),
})

export type TCreateSchema = z.infer<typeof ZCreateSchema>
