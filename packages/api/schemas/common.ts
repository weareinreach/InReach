import { Prisma } from '@weareinreach/db'
import superjson from 'superjson'
import { z } from 'zod'

import { AuditLogBaseUnion } from './create/auditLog'

export const cuid = z.union([z.string().cuid(), z.string().cuid2()])
export const cuidOptional = z.union([z.string().cuid().nullish(), z.string().cuid2().nullish()])

export const id = z.object({ id: cuid })
export const userId = z.object({ userId: cuid })
export const orgId = z.object({ orgId: cuid })
export const organizationId = z.object({ organizationId: cuid })
export const orgIdServiceId = orgId.extend({ serviceId: cuid })
export const orgIdLocationId = orgId.extend({ locationId: cuid })
export const slug = z.object({ slug: z.string() })

export const searchTerm = z.object({ search: z.string() })

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

export const MutationBase = <T extends z.ZodRawShape>(
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
export const CreationBase = <T extends z.ZodRawShape>(
	schema: z.ZodObject<T, 'strip', z.ZodTypeAny, z.objectOutputType<T, z.ZodTypeAny>>
) => ({
	dataParser: z.object({
		actorId: z.string(),
		data: schema,
		operation: z.enum(['CREATE', 'LINK']),
	}),
	inputSchema: schema,
})

export const MutationBaseArray = <T extends z.ZodRawShape>(
	schema: z.ZodObject<T, 'strip', z.ZodTypeAny, z.objectOutputType<T, z.ZodTypeAny>>
) => ({
	dataParser: z.object({
		actorId: z.string(),
		data: z
			.object({
				from: schema.deepPartial().optional(),
				to: schema,
			})
			.array(),
		operation: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LINK', 'UNLINK']),
	}),
	inputSchema: z
		.object({
			from: schema.deepPartial().optional(),
			to: schema,
		})
		.array(),
})
