import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForServiceEditDrawerSchema = prefixedId('orgService')
export type TForServiceEditDrawerSchema = z.infer<typeof ZForServiceEditDrawerSchema>
