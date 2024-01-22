import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForContactInfoSchema = z.object({
	parentId: prefixedId(['organization', 'orgLocation']),
	locationOnly: z.boolean().optional(),
})
export type TForContactInfoSchema = z.infer<typeof ZForContactInfoSchema>
