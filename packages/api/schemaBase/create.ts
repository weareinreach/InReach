import { z } from 'zod'

export const CreateBase = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => ({
	dataParser: z.object({
		actorId: z.string(),
		data: schema,
		operation: z.enum(['CREATE', 'LINK', 'UNLINK']),
	}),
	inputSchema: schema,
})
