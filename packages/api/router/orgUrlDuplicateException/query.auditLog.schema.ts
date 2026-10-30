import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZAuditLogSchema = z.object({
	id: prefixedId('orgUrlDuplicateException'),
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(20),
})
export type TAuditLogSchema = z.infer<typeof ZAuditLogSchema>
