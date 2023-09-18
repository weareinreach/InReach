import { z } from 'zod'

/**
 * Base to create one or many records. Pass the schema in as a singular object (this fuction will
 * automatically union it with an array of the object)
 */
export const CreateOneOrManyBase = <
	TSchema extends z.ZodObject<
		z.ZodRawShape,
		'strip',
		z.ZodTypeAny,
		z.objectOutputType<z.ZodRawShape, z.ZodTypeAny>
	>,
>(
	schema: TSchema
) => ({
	dataParser: z.object({
		actorId: z.string(),
		data: schema.or(schema.array()),
		operation: z.enum(['CREATE', 'LINK', 'UNLINK']),
	}),
	inputSchema: schema.or(schema.array()),
})
