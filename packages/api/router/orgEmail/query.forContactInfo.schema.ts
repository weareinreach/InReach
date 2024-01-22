import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForContactInfoSchema = z.object({
	parentId: prefixedId(['organization', 'orgLocation', 'orgService']),
	locationOnly: z.boolean().optional(),
	serviceOnly: z.boolean().optional(),
})
export type TForContactInfoSchema = z.infer<typeof ZForContactInfoSchema>
