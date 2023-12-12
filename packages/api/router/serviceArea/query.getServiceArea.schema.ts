import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetServiceAreaSchema = prefixedId('serviceArea')
export type TGetServiceAreaSchema = z.infer<typeof ZGetServiceAreaSchema>
