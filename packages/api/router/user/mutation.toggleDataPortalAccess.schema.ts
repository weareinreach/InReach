import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZToggleDataPortalAccessSchema = z.object({
	userId: prefixedId('user'),
	action: z.enum(['allow', 'deny']),
})
export type TToggleDataPortalAccessSchema = z.infer<typeof ZToggleDataPortalAccessSchema>
