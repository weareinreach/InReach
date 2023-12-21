import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetSubDistrictsSchema = prefixedId('govDist')
export type TGetSubDistrictsSchema = z.infer<typeof ZGetSubDistrictsSchema>
