import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUnDeleteSchema = z.object({ id: prefixedId('orgUrlDuplicateException') })
export type TUnDeleteSchema = z.infer<typeof ZUnDeleteSchema>
