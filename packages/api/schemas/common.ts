import { Prisma } from '@weareinreach/db'
import superjson from 'superjson'
import { z } from 'zod'

import { CreateAuditLog } from './create/auditLog'

/**
 * `*************`
 *
 * Zod shortcuts
 *
 * `*************`
 */

/** Cuid v1 or v2 */
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

// Prisma JSON helpers
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
/** Prisma JSON type serialized via SuperJSON */
export const JsonInputOrNullSuperJSON = z.preprocess((data) => superjson.serialize(data), JsonInputOrNull)

/**
 * `*************`
 *
 * Zod API schema bases
 *
 * `*************`
 */

/** For an update operation */
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
/** For a create operation */
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

/** For a createMany or updateMany operation */
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

/**
 * `*************`
 *
 * Prisma nesting helpers
 *
 * `*************`
 */
/** Array to a createMany object */
export const createMany = <T extends Array<any>>(data: T) =>
	({
		createMany: {
			data,
			skipDuplicates: true,
		},
	} as const)

/** Array to createMany object or `undefined` if no data provided */
export const createManyOrUndefined = <T extends Array<any> | undefined>(data: T) =>
	!data
		? undefined
		: ({
				createMany: {
					data,
					skipDuplicates: true,
				},
		  } as const)

/** Array to individual nested create records with individual Audit Logs */
export const createManyWithAudit = <T extends Array<any> | undefined>(data: T, actorId: string) =>
	!data
		? undefined
		: ({
				create: data.map((record) => ({
					...record,
					auditLogs: CreateAuditLog({ actorId, operation: 'CREATE', to: record }),
				})),
		  } as const)
/** Individual create record */
export const createOne = <T extends Record<string, any>>(data: T | undefined) =>
	!data
		? undefined
		: ({
				create: data,
		  } as const)

/** Individual create record with audit log */
export const createOneWithAudit = <T extends Record<string, any>>(data: T | undefined, actorId: string) =>
	!data
		? undefined
		: ({
				create: {
					...data,
					auditLogs: CreateAuditLog({ actorId, operation: 'CREATE', to: data }),
				},
		  } as const)

export const connectOne = <T extends Record<string, any>>(data: T | undefined) =>
	!data
		? undefined
		: ({
				connect: data,
		  } as const)

export const connectOneRequired = <T extends Record<string, any>>(data: T) =>
	({
		connect: data,
	} as const)
