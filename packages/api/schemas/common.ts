import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

const cuid = z.string().cuid()

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
