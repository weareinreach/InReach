import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZShareUrlSchema = z.object({ id: prefixedId('userSavedList') })
export type TShareUrlSchema = z.infer<typeof ZShareUrlSchema>
