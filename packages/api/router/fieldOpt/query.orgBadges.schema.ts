import { z } from 'zod'

export const ZOrgBadgesSchema = z.object({ badgeType: z.enum(['organization-leadership', 'service-focus']) })
export type TOrgBadgesSchema = z.infer<typeof ZOrgBadgesSchema>
