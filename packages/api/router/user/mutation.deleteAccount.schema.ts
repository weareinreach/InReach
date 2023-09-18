import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZDeleteAccountSchema = z.string()
export type TDeleteAccountSchema = z.infer<typeof ZDeleteAccountSchema>
