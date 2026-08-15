import { z } from 'zod'

import { coerceCoordItems, pagination } from '~api/schemas/common'

export const distSearch = z.object({
	...coerceCoordItems,
	dist: z.coerce.number(),
	unit: z.enum(['mi', 'km']),
	...pagination,
	services: z.string().array().optional(),
	attributes: z.string().array().optional(),
})
export type DistSearch = z.infer<typeof distSearch>
