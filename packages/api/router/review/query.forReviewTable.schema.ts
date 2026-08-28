import { z } from 'zod'

const ZDateRange = z
	.object({
		from: z.date().optional(),
		to: z.date().optional(),
	})
	.partial()

export const ZSortableColumn = z.enum([
	'createdAt',
	'updatedAt',
	'rating',
	'reviewText',
	'userName',
	'userEmail',
	'organization',
])

const ZSortingState = z.array(
	z.object({
		id: ZSortableColumn,
		desc: z.boolean(),
	})
)

export const ZForReviewTableSchema = z.object({
	visible: z.boolean().optional(),
	deleted: z.boolean().optional(),
	rating: z.coerce.number().int().min(1).max(5).optional(),
	search: z.string().optional(),
	createdAt: ZDateRange.optional(),
	updatedAt: ZDateRange.optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})
export type TForReviewTableSchema = z.infer<typeof ZForReviewTableSchema>
