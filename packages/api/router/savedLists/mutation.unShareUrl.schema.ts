import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUnShareUrlSchema = z.object({ id: prefixedId('userSavedList') })
export type TUnShareUrlSchema = z.infer<typeof ZUnShareUrlSchema>
