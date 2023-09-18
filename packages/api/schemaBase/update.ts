import { z } from 'zod'

export const UpdateBase = <T extends z.ZodRawShape>(
	schema: z.ZodObject<T, 'strip', z.ZodTypeAny, z.objectOutputType<T, z.ZodTypeAny>>
) => ({
	dataParser: z.object({
		actorId: z.string(),
		from: schema.deepPartial().optional(),
		to: schema,
		operation: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LINK', 'UNLINK']),
	}),
	inputSchema: z
		.object({
			from: schema.deepPartial().optional(),
			to: schema,
		})
		.or(schema),
})
