import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByOrgIdSchema = z.object({ orgId: prefixedId('organization') })
export type TGetByOrgIdSchema = z.infer<typeof ZGetByOrgIdSchema>
