import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForVisitCardSchema = prefixedId('orgLocation')
export type TForVisitCardSchema = z.infer<typeof ZForVisitCardSchema>
