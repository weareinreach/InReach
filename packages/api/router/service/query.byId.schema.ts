import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZByIdSchema = z.object({ id: prefixedId('orgService') })
export type TByIdSchema = z.infer<typeof ZByIdSchema>
