import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZLocationLinkSchema = z.object({
	orgWebsiteId: prefixedId('orgWebsite'),
	orgLocationId: prefixedId('orgLocation'),
	action: z.enum(['link', 'unlink']),
})
export type TLocationLinkSchema = z.infer<typeof ZLocationLinkSchema>
