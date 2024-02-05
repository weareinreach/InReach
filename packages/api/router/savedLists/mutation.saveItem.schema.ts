import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZSaveItemSchema = z.object({
	id: prefixedId('userSavedList'),
	organizationId: prefixedId('organization').optional(),
	serviceId: prefixedId('orgService').optional(),
})

export type TSaveItemSchema = z.infer<typeof ZSaveItemSchema>
