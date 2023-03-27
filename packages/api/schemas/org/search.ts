import { z } from 'zod'

import { coordItems, pagination } from '~api/schemas/common'

export const distSearch = z.object({
	...coordItems,
	dist: z.number(),
	unit: z.enum(['mi', 'km']),
	...pagination,
	services: z.string().array().optional(),
	attributes: z.string().array().optional(),
})
export type DistSearch = z.infer<typeof distSearch>
