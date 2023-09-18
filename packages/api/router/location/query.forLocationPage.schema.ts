import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForLocationPageSchema = z.object({ id: prefixedId('orgLocation') })
export type TForLocationPageSchema = z.infer<typeof ZForLocationPageSchema>
