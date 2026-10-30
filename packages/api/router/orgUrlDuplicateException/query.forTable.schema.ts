import { z } from 'zod'

const ZDateRange = z
	.object({
		from: z.date().optional(),
		to: z.date().optional(),
	})
	.partial()

export const ZSortableColumn = z.enum(['baseUrl', 'active', 'createdAt', 'updatedAt'])

const ZSortingState = z.array(
	z.object({
		id: ZSortableColumn,
		desc: z.boolean(),
	})
)

export const ZForTableSchema = z.object({
	active: z.boolean().optional(),
	search: z.string().optional(),
	createdAt: ZDateRange.optional(),
	updatedAt: ZDateRange.optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})
export type TForTableSchema = z.infer<typeof ZForTableSchema>
