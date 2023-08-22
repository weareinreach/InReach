import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetFeaturedSchema = z.number()
export type TGetFeaturedSchema = z.infer<typeof ZGetFeaturedSchema>
