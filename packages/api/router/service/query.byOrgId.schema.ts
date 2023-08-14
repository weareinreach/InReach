import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZByOrgIdSchema = z.object({
	organizationId: prefixedId('organization'),
})
export type TByOrgIdSchema = z.infer<typeof ZByOrgIdSchema>
