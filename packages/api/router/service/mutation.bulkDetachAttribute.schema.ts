import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZBulkDetachAttributeSchema = z.object({
	serviceIds: prefixedId('orgService').array().min(1),
	attributeId: prefixedId('attribute'),
})
export type TBulkDetachAttributeSchema = z.infer<typeof ZBulkDetachAttributeSchema>
