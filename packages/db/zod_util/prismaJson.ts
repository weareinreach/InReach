import { z } from 'zod'

import { superjson } from '@weareinreach/util/transformer'

import { type Prisma } from '..'

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
export const JsonInputOrNullSuperJSON = z.preprocess((data) => superjson.serialize(data), JsonInputOrNull)
