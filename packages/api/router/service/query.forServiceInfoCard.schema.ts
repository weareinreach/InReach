import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForServiceInfoCardSchema = z.object({
	parentId: prefixedId(['organization', 'orgLocation']),
	remoteOnly: z.boolean().optional(),
	isEditMode: z.boolean().optional(),
})
export type TForServiceInfoCardSchema = z.infer<typeof ZForServiceInfoCardSchema>
