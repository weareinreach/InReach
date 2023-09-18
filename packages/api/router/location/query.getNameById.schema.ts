import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetNameByIdSchema = prefixedId('orgLocation')
export type TGetNameByIdSchema = z.infer<typeof ZGetNameByIdSchema>
