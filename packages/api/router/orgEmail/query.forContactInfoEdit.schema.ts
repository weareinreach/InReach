import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForContactInfoEditSchema = z.object({
	parentId: prefixedId(['organization', 'orgLocation', 'orgService']),
})
export type TForContactInfoEditSchema = z.infer<typeof ZForContactInfoEditSchema>
