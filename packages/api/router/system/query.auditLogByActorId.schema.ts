import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZAuditLogByActorIdSchema = z.object({
	actorId: prefixedId('user'),
	skip: z.number().positive().int().optional(),
	take: z.number().positive().int().optional(),
	sort: z.enum(['new', 'old']).default('new'),
})
export type TAuditLogByActorIdSchema = z.infer<typeof ZAuditLogByActorIdSchema>
