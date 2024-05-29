import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForLocationCardSchema = z.object({
	id: prefixedId('orgLocation'),
	isEditMode: z.boolean().optional().default(false),
})
export type TForLocationCardSchema = z.infer<typeof ZForLocationCardSchema>
