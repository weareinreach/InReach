import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZBulkAttachTagsSchema = z.object({
	serviceIds: prefixedId('orgService').array().min(1),
	tagId: prefixedId('serviceTag'),
})
export type TBulkAttachTagsSchema = z.infer<typeof ZBulkAttachTagsSchema>
