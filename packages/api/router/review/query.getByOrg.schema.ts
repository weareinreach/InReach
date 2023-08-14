import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByOrgSchema = z.object({ orgId: prefixedId('organization') })
export type TGetByOrgSchema = z.infer<typeof ZGetByOrgSchema>
