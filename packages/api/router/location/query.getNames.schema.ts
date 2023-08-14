import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetNamesSchema = z.object({ organizationId: prefixedId('organization') })
export type TGetNamesSchema = z.infer<typeof ZGetNamesSchema>
