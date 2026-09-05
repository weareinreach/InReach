import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZBulkAttachAttributeSchema = z.object({
	serviceIds: prefixedId('orgService').array().min(1),
	attributeId: prefixedId('attribute'),
})
export type TBulkAttachAttributeSchema = z.infer<typeof ZBulkAttachAttributeSchema>
