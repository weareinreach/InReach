import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZBulkDetachTagsSchema = z.object({
	serviceIds: prefixedId('orgService').array().min(1),
	tagId: prefixedId('serviceTag'),
})
export type TBulkDetachTagsSchema = z.infer<typeof ZBulkDetachTagsSchema>
