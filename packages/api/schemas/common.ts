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
export const idString = z.string()
export const idOptional = z.string().optional()
export const id = z.object({ id: z.string() })
export const idArray = z.object({ ids: z.string().array() })
export const actorId = z.object({ actorId: z.string() })
export const userId = z.object({ userId: z.string() })
export const orgId = z.object({ orgId: z.string() })
export const organizationId = z.object({ organizationId: z.string() })
export const orgIdServiceId = z.object({ orgId: z.string(), serviceId: z.string() })
export const orgIdLocationId = z.object({ orgId: z.string(), locationId: z.string() })
export const slug = z.object({ slug: z.string() })
export const nanoIdUrl = z.string().regex(nanoUrlRegex)
export const searchTerm = z.object({ search: z.string().trim() })
export const pagination = {
	skip: z.number().optional(),
	take: z.number().optional(),
}
export const coordItems = {
	lat: z.number().gte(-90).lte(90),
	lon: z.number().gte(-180).lte(180),
}
export const coord = z.object(coordItems)
export const reviewAvgId = z
	.object({ organizationId: idString, orgServiceId: idString, orgLocationId: idString })
	.partial()

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
