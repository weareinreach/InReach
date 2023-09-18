import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForLocationCardSchema = prefixedId('orgLocation')
export type TForLocationCardSchema = z.infer<typeof ZForLocationCardSchema>
