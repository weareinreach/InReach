import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZIsSavedSchema = z.union([prefixedId('organization'), prefixedId('orgService')])
export type TIsSavedSchema = z.infer<typeof ZIsSavedSchema>
