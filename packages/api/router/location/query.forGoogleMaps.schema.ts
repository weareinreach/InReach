import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForGoogleMapsSchema = prefixedId('orgLocation').or(prefixedId('orgLocation').array())
export type TForGoogleMapsSchema = z.infer<typeof ZForGoogleMapsSchema>
