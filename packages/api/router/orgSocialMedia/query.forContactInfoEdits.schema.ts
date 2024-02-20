import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForContactInfoEditsSchema = z.object({
	parentId: prefixedId(['organization', 'orgLocation']),
})
export type TForContactInfoEditsSchema = z.infer<typeof ZForContactInfoEditsSchema>
