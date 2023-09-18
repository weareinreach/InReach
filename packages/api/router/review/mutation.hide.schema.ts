import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZHideSchema = z.object({ id: prefixedId('orgReview') })
export type THideSchema = z.infer<typeof ZHideSchema>
