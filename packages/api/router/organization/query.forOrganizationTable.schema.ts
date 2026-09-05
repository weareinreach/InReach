import { z } from 'zod'

import { OrgUnpublishedReason } from '@weareinreach/db/enums'

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

// Doesn't map to one literal DB column. 'public' = source.source === 'suggestion' AND
// creatorHadDpAccess === false. 'internal' is a union of the other two real origins: suggested by
// someone with Data Portal access, OR added directly via the Data Portal - both mean "not actually the
// public." Omitted entirely = no filter ("All").
export const ZCreateMethod = z.enum(['public', 'internal'])

// Supersedes a plain `published` boolean filter - 'published' means `published: true`, every other
// value means `published: false` AND that specific `unpublishedReason`. One filter answers "what's this
// org's status," not two (see docs/DataPortal/Organizations/README.md). Omitted/empty = "All".
export const ZStatusFilter = z.enum([
	'published',
	'new',
	'in-progress',
	'waiting',
	'inactive',
	'unaffirming',
	'unresponsive',
])
export type TStatusFilter = z.infer<typeof ZStatusFilter>

// Maps the hyphenated filter/wire value to the actual Prisma enum member - single source of truth,
// imported by both the real handler's `statusWhere` and the ui package's mock data, instead of each
// keeping its own copy that has to be kept in sync by hand.
export const STATUS_FILTER_TO_REASON: Record<Exclude<TStatusFilter, 'published'>, OrgUnpublishedReason> = {
	new: OrgUnpublishedReason.NEW,
	'in-progress': OrgUnpublishedReason.IN_PROGRESS,
	waiting: OrgUnpublishedReason.WAITING,
	inactive: OrgUnpublishedReason.INACTIVE,
	unaffirming: OrgUnpublishedReason.UNAFFIRMING,
	unresponsive: OrgUnpublishedReason.UNRESPONSIVE,
}

export const ZForOrganizationTableSchema = z.object({
	// Multi-select - selecting several is a union (OR), same convention as `createMethod`/ReportTable's
	// `issueType`.
	status: z.array(ZStatusFilter).optional(),
	deleted: z.boolean().optional(),
	createMethod: ZCreateMethod.optional(),
	search: z.string().optional(),
	lastVerified: ZDateRange.optional(),
	updatedAt: ZDateRange.optional(),
	createdAt: ZDateRange.optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})
export type TForOrganizationTableSchema = z.infer<typeof ZForOrganizationTableSchema>
