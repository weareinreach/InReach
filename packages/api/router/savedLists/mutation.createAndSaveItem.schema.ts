import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateAndSaveItemSchema = z
	.object({
		name: z.string(),
		organizationId: prefixedId('organization').optional(),
		serviceId: prefixedId('orgService').optional(),
	})
	.refine(
		(keys) => {
			if (keys.organizationId || keys.serviceId) return true
			else return false
		},
		{ message: 'Requires one of the following: organizationId, serviceId' }
	)

export type TCreateAndSaveItemSchema = z.infer<typeof ZCreateAndSaveItemSchema>
