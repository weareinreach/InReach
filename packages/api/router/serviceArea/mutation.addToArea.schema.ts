import { type Simplify } from 'type-fest'
import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

const organization = z.object({ organizationId: prefixedId('organization') })
const orgLocation = z.object({ orgLocationId: prefixedId('orgLocation') })
const orgService = z.object({ orgServiceId: prefixedId('orgService') })

const serviceArea = z.union([prefixedId('serviceArea'), organization, orgLocation, orgService])

export const ZAddToAreaSchema = z
	.object({
		serviceArea,
		countryId: prefixedId('country').optional(),
		govDistId: prefixedId('govDist').optional(),
	})
	.refine(
		(data) =>
			(typeof data.countryId === 'string' || typeof data.govDistId === 'string') &&
			!(typeof data.countryId === 'string' && typeof data.govDistId === 'string'),
		{
			message: 'Only one of countryId or govDistId must be provided',
		}
	)
export type TAddToAreaSchema = Simplify<z.infer<typeof ZAddToAreaSchema>>
