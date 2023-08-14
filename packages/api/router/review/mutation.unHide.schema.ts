import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZUnHideSchema = z.object({ id: prefixedId('orgReview') })
export type TUnHideSchema = z.infer<typeof ZUnHideSchema>
