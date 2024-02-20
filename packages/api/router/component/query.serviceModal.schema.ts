import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZServiceModalSchema = z.object({ id: prefixedId('orgService') })
export type TServiceModalSchema = z.infer<typeof ZServiceModalSchema>
