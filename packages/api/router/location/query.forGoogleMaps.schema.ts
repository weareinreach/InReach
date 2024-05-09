import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForGoogleMapsSchema = z.object({
	locationIds: prefixedId('orgLocation').array(),
	isEditMode: z.boolean().optional().default(false),
})
export type TForGoogleMapsSchema = z.infer<typeof ZForGoogleMapsSchema>
