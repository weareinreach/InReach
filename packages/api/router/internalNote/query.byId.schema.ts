import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZByIdSchema = prefixedId('internalNote')
export type TByIdSchema = z.infer<typeof ZByIdSchema>
