import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateAndSaveItemSchema = z
	.object({
		name: z.string(),
		organizationId: prefixedId('organization').optional(),
		serviceId: prefixedId('orgService').optional(),
		itemId: prefixedId('organization').or(prefixedId('orgService')).optional(),
	})
	.refine(({ organizationId, serviceId, itemId }) => Boolean(organizationId ?? serviceId ?? itemId), {
		message: 'Requires one of the following: organizationId, serviceId, or itemId',
	})
	.transform(({ name, organizationId, serviceId, itemId }) => {
		if (itemId !== undefined) {
			return { name, itemId }
		}
		return { name, itemId: (organizationId ?? serviceId) as string }
	})

export type TCreateAndSaveItemSchema = z.infer<typeof ZCreateAndSaveItemSchema>
