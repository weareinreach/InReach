import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForServiceInfoCardSchema = z.object({
	parentId: prefixedId('organization').or(prefixedId('orgLocation')),
	remoteOnly: z.boolean().optional(),
})
export type TForServiceInfoCardSchema = z.infer<typeof ZForServiceInfoCardSchema>
