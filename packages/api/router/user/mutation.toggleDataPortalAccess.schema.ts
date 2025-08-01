import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZToggleDataPortalAccessSchema = z.object({
	userId: prefixedId('user'),
	action: z.enum(['allow', 'deny']),
	permissionId: z.string().optional(),
})
export type TToggleDataPortalAccessSchema = z.infer<typeof ZToggleDataPortalAccessSchema>
