import { z } from 'zod'

const ZDateRange = z
	.object({
		from: z.date().optional(),
		to: z.date().optional(),
	})
	.partial()

export const ZSortableColumn = z.enum(['name', 'lastVerified', 'updatedAt', 'createdAt'])

const ZSortingState = z.array(
	z.object({
		id: ZSortableColumn,
		desc: z.boolean(),
	})
)

export const ZForOrganizationTableSchema = z.object({
	published: z.boolean().optional(),
	deleted: z.boolean().optional(),
	search: z.string().optional(),
	lastVerified: ZDateRange.optional(),
	updatedAt: ZDateRange.optional(),
	createdAt: ZDateRange.optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})
export type TForOrganizationTableSchema = z.infer<typeof ZForOrganizationTableSchema>
