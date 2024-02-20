import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForEditDrawerSchema = z.object({ id: prefixedId('orgPhone') })
export type TForEditDrawerSchema = z.infer<typeof ZForEditDrawerSchema>
