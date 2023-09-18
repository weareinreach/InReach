import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByUserSchema = z.object({ userId: prefixedId('user') })
export type TGetByUserSchema = z.infer<typeof ZGetByUserSchema>
