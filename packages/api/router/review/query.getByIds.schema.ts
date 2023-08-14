import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByIdsSchema = prefixedId('orgReview').array()
export type TGetByIdsSchema = z.infer<typeof ZGetByIdsSchema>
