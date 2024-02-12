import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetLinkOptionsSchema = z.object({ slug: z.string(), locationId: prefixedId('orgLocation') })
export type TGetLinkOptionsSchema = z.infer<typeof ZGetLinkOptionsSchema>
