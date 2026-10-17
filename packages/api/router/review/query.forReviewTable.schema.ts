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

/**
 * Named status buckets for the Status column's filter - independent of, and additive with, the plain
 * `visible`/`deleted` toggles (which the toolbar's own Show/Hide controls still set directly). 'active' and
 * 'hidden' are mutually exclusive by `visible`; 'deleted' wins regardless of `visible` so a
 * hidden-and-deleted review is still findable under "Deleted," matching the Status column's own badges.
 */
export const ZReviewStatusFilter = z.enum(['active', 'hidden', 'deleted'])
export type TReviewStatusFilter = z.infer<typeof ZReviewStatusFilter>

export const ZForReviewTableSchema = z.object({
	visible: z.boolean().optional(),
	deleted: z.boolean().optional(),
	status: z.array(ZReviewStatusFilter).optional(),
	rating: z.array(z.coerce.number().int().min(1).max(5)).optional(),
	search: z.string().optional(),
	/** Filters to reviews left by any of these users - the "Created By" type-ahead filter (multi-select). */
	createdByUserIds: z.array(z.string()).optional(),
	createdAt: ZDateRange.optional(),
	updatedAt: ZDateRange.optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})
export type TForReviewTableSchema = z.infer<typeof ZForReviewTableSchema>
