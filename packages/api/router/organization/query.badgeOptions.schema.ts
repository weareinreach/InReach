import { z } from 'zod'

export const ZBadgeOptionsSchema = z.object({
	badgeType: z.enum(['organization-leadership', 'service-focus']),
})
export type TBadgeOptionsSchema = z.infer<typeof ZBadgeOptionsSchema>
