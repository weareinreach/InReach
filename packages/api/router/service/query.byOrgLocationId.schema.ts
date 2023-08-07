import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZByOrgLocationIdSchema = z.object({
	orgLocationId: prefixedId('orgLocation'),
})
export type TByOrgLocationIdSchema = z.infer<typeof ZByOrgLocationIdSchema>
