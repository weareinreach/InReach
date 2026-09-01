import { z } from 'zod'

// Matches the five tier labels produced by TIER_CASE_SQL in lib/unpublishedStatusTiers.ts.
export const ZUnpublishedStatusTier = z.enum([
	'1a - Never verified, not deleted, created <30d ago',
	'1b - Never verified, not deleted, created 30d+ ago',
	'2 - Never verified, deleted',
	'3 - Previously verified, deleted',
	'4 - Previously verified, still unpublished, never deleted',
])

export const ZSortableColumn = z.enum(['name', 'createdAt', 'lastVerified', 'updatedAt'])

const ZSortingState = z.array(
	z.object({
		id: ZSortableColumn,
		desc: z.boolean(),
	})
)

export const ZUnpublishedStatusWorklistSchema = z.object({
	tier: ZUnpublishedStatusTier.optional(),
	search: z.string().optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})

export type TUnpublishedStatusWorklistSchema = z.infer<typeof ZUnpublishedStatusWorklistSchema>
