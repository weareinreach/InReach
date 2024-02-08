import { z } from 'zod'

import { type IdPrefix, idPrefix, prefixedId } from '~api/schemas/idPrefix'

const itemId = prefixedId(Object.keys(idPrefix) as IdPrefix[])
export const ZAuditLogByRecordIdSchema = z.object({
	recordId: itemId.array(),
	skip: z.number().positive().int().optional(),
	take: z.number().positive().int().optional(),
	sort: z.enum(['new', 'old']).default('new'),
})
export type TAuditLogByRecordIdSchema = z.infer<typeof ZAuditLogByRecordIdSchema>
