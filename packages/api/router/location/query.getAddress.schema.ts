import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetAddressSchema = prefixedId('orgLocation')
export type TGetAddressSchema = z.infer<typeof ZGetAddressSchema>
