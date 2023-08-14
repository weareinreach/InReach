import { DateTime } from 'luxon'
import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZCreateSchema = z.object({
	/** Sun 0, Mon 1, Tue 2, Wed 3, Thu 3, Fri 4, Sat 6 */
	dayIndex: z.number().gte(0).lte(6),
	start: z.coerce.date(),
	end: z.coerce.date(),
	tz: z
		.string()
		.refine((val) => DateTime.now().setZone(val).isValid)
		.optional(),
	orgLocId: prefixedId('orgLocation').optional(),
	orgServiceId: prefixedId('orgService').optional(),
	organizationId: prefixedId('organization').optional(),
	closed: z.boolean(),
})
export type TCreateSchema = z.infer<typeof ZCreateSchema>
