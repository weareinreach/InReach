import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForBadgeEditModalSchema = z.object({
	id: prefixedId('organization'),
	badgeType: z.enum(['organization-leadership', 'service-focus']),
})
export type TForBadgeEditModalSchema = z.infer<typeof ZForBadgeEditModalSchema>
