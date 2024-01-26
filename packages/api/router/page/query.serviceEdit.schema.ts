import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZServiceEditSchema = z.object({ id: prefixedId('orgService') })
export type TServiceEditSchema = z.infer<typeof ZServiceEditSchema>
