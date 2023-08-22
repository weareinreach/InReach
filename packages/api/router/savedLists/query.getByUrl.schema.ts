import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByUrlSchema = z.object({ slug: z.string() })
export type TGetByUrlSchema = z.infer<typeof ZGetByUrlSchema>
