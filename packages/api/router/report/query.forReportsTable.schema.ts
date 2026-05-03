import { z } from 'zod'

import { ReportIssueType, ReportStatus } from '@weareinreach/db/enums'

export const ZForReportsTableSchema = z
	.object({
		id: z.string(),
		status: z.nativeEnum(ReportStatus),
		issueType: z.nativeEnum(ReportIssueType),
		organizationId: z.string(),
	})
	.partial()
	.optional()

export type TForReportsTableSchema = z.infer<typeof ZForReportsTableSchema>
