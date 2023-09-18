import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForServiceModalSchema = prefixedId('orgService')
export type TForServiceModalSchema = z.infer<typeof ZForServiceModalSchema>
