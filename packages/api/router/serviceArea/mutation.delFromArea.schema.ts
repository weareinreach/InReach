import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZDelFromAreaSchema = z
	.object({
		serviceAreaId: prefixedId('serviceArea'),
		countryId: z.string().optional(),
		govDistId: z.string().optional(),
	})
	.refine(
		(data) =>
			(typeof data.countryId === 'string' || typeof data.govDistId === 'string') &&
			!(typeof data.countryId === 'string' && typeof data.govDistId === 'string'),
		{
			message: 'Only one of countryId or govDistId must be provided',
		}
	)
export type TDelFromAreaSchema = z.infer<typeof ZDelFromAreaSchema>
