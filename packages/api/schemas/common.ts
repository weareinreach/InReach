import {
	InputJsonValue,
	type InputJsonValueType,
	JsonInputOrNull,
	JsonNullValueInputSchema,
} from '@weareinreach/db/zod_util'
import superjson from 'superjson'
import { z } from 'zod'

import { nanoUrlRegex } from '~api/lib/nanoIdUrl'

/**
 * `*************`
 *
 * Zod shortcuts
 *
 * `*************`
 */

/** Cuid v1 or v2 */
export const cuidOptional = z.union([z.string().cuid().nullish(), z.string().cuid2().nullish()])
export const cuid = z.string().cuid().or(z.string().cuid2())
export const id = z.object({ id: cuid })
export const actorId = z.object({ actorId: cuid })
export const userId = z.object({ userId: cuid })
export const orgId = z.object({ orgId: cuid })
export const organizationId = z.object({ organizationId: cuid })
export const orgIdServiceId = orgId.extend({ serviceId: cuid })
export const orgIdLocationId = orgId.extend({ locationId: cuid })
export const slug = z.object({ slug: z.string() })
export const nanoIdUrl = z.string().regex(nanoUrlRegex)
export const searchTerm = z.object({ search: z.string() })
export const coord = z.object({
	lat: z.number(),
	lon: z.number(),
})
export const distSearch = coord.extend({ dist: z.number(), unit: z.enum(['mi', 'km']) })

// Prisma JSON helpers
export { InputJsonValue, JsonNullValueInputSchema, type InputJsonValueType }
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
/** For a create or m-to-n link operation */
export const CreationBase = <T extends z.ZodRawShape>(
	schema: z.ZodObject<T, 'strip', z.ZodTypeAny, z.objectOutputType<T, z.ZodTypeAny>>
) => ({
	dataParser: z.object({
		actorId: z.string(),
		data: schema,
		operation: z.enum(['CREATE', 'LINK', 'UNLINK']),
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
