import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByIdSchema = z.object({ id: prefixedId('orgLocation') })
export type TGetByIdSchema = z.infer<typeof ZGetByIdSchema>
