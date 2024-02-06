import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForLocationPageEditsSchema = z.object({ id: prefixedId('orgLocation') })
export type TForLocationPageEditsSchema = z.infer<typeof ZForLocationPageEditsSchema>
