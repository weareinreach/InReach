import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZDeleteItemSchema = z
	.object({
		id: prefixedId('userSavedList'),
		organizationId: prefixedId('organization').optional(),
		serviceId: prefixedId('orgService').optional(),
		itemId: prefixedId('organization').or(prefixedId('orgService')).optional(),
	})
	.refine(({ organizationId, serviceId, itemId }) => Boolean(organizationId ?? serviceId ?? itemId), {
		message: 'Must provide either organizationId, serviceId, or itemId',
	})
	.transform(({ id, organizationId, serviceId, itemId }) => {
		if (itemId !== undefined) {
			return { id, itemId }
		}
		return { id, itemId: (organizationId ?? serviceId) as string }
	})

export type TDeleteItemSchema = z.infer<typeof ZDeleteItemSchema>
