import { z } from 'zod'

export const CreateManyBase = <T extends z.ZodArray<z.ZodTypeAny>>(schema: T) => ({
	dataParser: z.object({
		actorId: z.string(),
		data: schema,
		operation: z.enum(['CREATE', 'LINK', 'UNLINK']),
	}),
	inputSchema: schema,
})
