import { z } from 'zod'

import { Prisma } from '~db/client'

export type NullableJsonInput =
	| Prisma.JsonValue
	| null
	| 'JsonNull'
	| 'DbNull'
	| Prisma.NullTypes.DbNull
	| Prisma.NullTypes.JsonNull

export const transformJsonNull = (v?: NullableJsonInput) => {
	if (!v || v === 'DbNull') return Prisma.DbNull
	if (v === 'JsonNull') return Prisma.JsonNull
	return v
}

export const JsonValue: z.ZodType<Prisma.JsonValue> = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.lazy(() => z.array(JsonValue)),
	z.lazy(() => z.record(JsonValue)),
])
export const InputJsonValue: z.ZodType<Prisma.InputJsonValue> = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.lazy(() => z.array(InputJsonValue)),
	z.lazy(() => z.record(InputJsonValue)),
])
export type JsonValueType = z.infer<typeof JsonValue>
export const NullableJsonValue = z
	.union([JsonValue, z.literal('DbNull'), z.literal('JsonNull')])
	.nullable()
	.transform((v) => transformJsonNull(v))

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>
