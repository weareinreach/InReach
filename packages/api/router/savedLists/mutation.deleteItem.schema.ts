import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZDeleteItemSchema = z.object({
	id: prefixedId('userSavedList'),
	organizationId: prefixedId('organization').optional(),
	serviceId: prefixedId('orgService').optional(),
})

export type TDeleteItemSchema = z.infer<typeof ZDeleteItemSchema>
