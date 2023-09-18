import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForGoogleMapsSchema = z.object({
	locationIds: prefixedId('orgLocation').array(),
})
export type TForGoogleMapsSchema = z.infer<typeof ZForGoogleMapsSchema>
