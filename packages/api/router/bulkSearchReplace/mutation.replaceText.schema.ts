import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

// Organization.name is deliberately excluded - changing it also regenerates the org's slug and creates a
// redirect (see mutation.updateBasic.handler.ts), a side effect too significant for a bulk text
// operation. Org name stays search-only; fixing one goes through the manual edit page. OrgService has no
// slug, so both its fields are safe to bulk-replace.
const ZOrgReplaceItem = z.object({
	recordType: z.literal('organization'),
	field: z.literal('description'),
	id: prefixedId('organization'),
	searchTerm: z.string().min(1),
	replaceTerm: z.string(),
})
const ZServiceReplaceItem = z.object({
	recordType: z.literal('service'),
	field: z.enum(['name', 'description']),
	id: prefixedId('orgService'),
	searchTerm: z.string().min(1),
	replaceTerm: z.string(),
})

export const ZReplaceTextItem = z.discriminatedUnion('recordType', [ZOrgReplaceItem, ZServiceReplaceItem])
export type TReplaceTextItem = z.infer<typeof ZReplaceTextItem>

export const ZReplaceTextSchema = z.object({
	items: z.array(ZReplaceTextItem).min(1).max(200),
})
export type TReplaceTextSchema = z.infer<typeof ZReplaceTextSchema>

export const ZReplaceTextResultStatus = z.enum(['replaced', 'skipped-not-found', 'failed'])
export type TReplaceTextResultStatus = z.infer<typeof ZReplaceTextResultStatus>
