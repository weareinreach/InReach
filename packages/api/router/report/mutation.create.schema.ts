import { z } from 'zod'

export const ZCreateSchema = z.object({
	orgId: z.string(),
	orgName: z.string().optional(),
	serviceId: z.string().optional(),
	serviceName: z.string().optional(),
	issueType: z.enum(['closed-inactive', 'incorrect-info', 'translation-quality', 'something-else']),
	userNote: z.string(),
	incorrectInfoFields: z.array(z.string()).optional(),
	language: z.string().optional(),
	user: z
		.object({
			name: z.string().nullish(),
			email: z.string().nullish(),
		})
		.nullish(),
	timestamp: z.string().optional(),
})

export type TCreateSchema = z.infer<typeof ZCreateSchema>
