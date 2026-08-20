import { z } from 'zod'

export const ZSortableColumn = z.enum(['name', 'email', 'createdAt', 'updatedAt', 'active'])

const ZSortingState = z.array(
	z.object({
		id: ZSortableColumn,
		desc: z.boolean(),
	})
)

export const ZForUserTableSchema = z.object({
	active: z.boolean().optional(),
	search: z.string().optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})
export type TForUserTableSchema = z.infer<typeof ZForUserTableSchema>
