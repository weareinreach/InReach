import { z } from 'zod'

const ZDateRange = z
	.object({
		from: z.date().optional(),
		to: z.date().optional(),
	})
	.partial()

export const ZSortableColumn = z.enum(['name', 'email', 'emailVerified', 'createdAt', 'updatedAt', 'active'])

const ZSortingState = z.array(
	z.object({
		id: ZSortableColumn,
		desc: z.boolean(),
	})
)

export const ZForUserTableSchema = z.object({
	active: z.boolean().optional(),
	search: z.string().optional(),
	createdAt: ZDateRange.optional(),
	updatedAt: ZDateRange.optional(),
	sorting: ZSortingState.optional(),
	/** Data portal access level(s) to filter by - `'none'` means "no data portal access at all". */
	permissionNames: z.array(z.string()).optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})
export type TForUserTableSchema = z.infer<typeof ZForUserTableSchema>
