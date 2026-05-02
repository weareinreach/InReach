import { z } from 'zod'

import { ReportStatus } from '@weareinreach/db/enums'

export const ZUpdateSchema = z.object({
	id: z.string(),
	status: z.nativeEnum(ReportStatus).optional(),
	internalNote: z.string().optional(),
})

export type TUpdateSchema = z.infer<typeof ZUpdateSchema>
