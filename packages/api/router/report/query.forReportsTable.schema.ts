import { z } from 'zod'

import { ReportIssueType, ReportStatus } from '@weareinreach/db/enums'

export const ZSortableColumn = z.enum(['createdAt', 'updatedAt'])

const ZSortingState = z.array(
	z.object({
		id: ZSortableColumn,
		desc: z.boolean(),
	})
)

export const ZForReportsTableSchema = z.object({
	id: z.string().optional(),
	status: z.nativeEnum(ReportStatus).optional(),
	issueType: z.array(z.nativeEnum(ReportIssueType)).optional(),
	organizationId: z.string().optional(),
	informed: z.boolean().optional(),
	search: z.string().optional(),
	sorting: ZSortingState.optional(),
	take: z.number().int().min(1).max(200).default(50),
	skip: z.number().int().min(0).default(0),
})

export type TForReportsTableSchema = z.infer<typeof ZForReportsTableSchema>
