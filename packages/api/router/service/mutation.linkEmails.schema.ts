import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZLinkEmailsSchema = z
	.object({
		orgEmailId: prefixedId('orgEmail'),
		serviceId: prefixedId('orgService'),
	})
	.array()

export type TLinkEmailsSchema = z.infer<typeof ZLinkEmailsSchema>
