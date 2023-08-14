import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZByUserListIdSchema = z.object({
	listId: prefixedId('userSavedList'),
})
export type TByUserListIdSchema = z.infer<typeof ZByUserListIdSchema>
