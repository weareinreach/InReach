import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZLinkPhonesSchema = z
	.object({
		orgPhoneId: prefixedId('orgPhone'),
		serviceId: prefixedId('orgService'),
	})
	.array()

export type TLinkPhonesSchema = z.infer<typeof ZLinkPhonesSchema>
