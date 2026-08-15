import { z } from 'zod'

export const UpdateBase = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => ({
	dataParser: z.object({
		actorId: z.string(),
		from: schema.partial().optional(),
		to: schema,
		operation: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LINK', 'UNLINK']),
	}),
	inputSchema: z
		.object({
			from: schema.partial().optional(),
			to: schema,
		})
		.or(schema),
})
