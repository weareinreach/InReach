import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForVisitCardEditsSchema = prefixedId('orgLocation')
export type TForVisitCardEditsSchema = z.infer<typeof ZForVisitCardEditsSchema>
