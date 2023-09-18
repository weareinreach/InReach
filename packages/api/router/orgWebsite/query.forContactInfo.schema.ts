import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForContactInfoSchema = z.object({
	parentId: z.union([prefixedId('organization'), prefixedId('orgLocation')]),
	locationOnly: z.boolean().optional(),
})
export type TForContactInfoSchema = z.infer<typeof ZForContactInfoSchema>
