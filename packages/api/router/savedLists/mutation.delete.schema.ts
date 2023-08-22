import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZDeleteSchema = z.object({ id: prefixedId('userSavedList') })
export type TDeleteSchema = z.infer<typeof ZDeleteSchema>
