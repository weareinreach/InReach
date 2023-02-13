import { z } from 'zod'

import { Prisma } from '../'

export const InputJsonValue: z.ZodType<Prisma.InputJsonValue> = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.lazy(() => z.array(InputJsonValue.nullable())),
	z.lazy(() => z.record(InputJsonValue.nullable())),
])
export type InputJsonValueType = z.infer<typeof InputJsonValue>
export const JsonNullValueInputSchema = z.enum(['JsonNull'])
export const JsonInputOrNull = z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValue])
