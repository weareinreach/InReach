import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZCityCoordsSchema = z.object({
	city: z.string(),
	govDist: prefixedId('govDist').nullish(),
	country: prefixedId('country'),
})
export type TCityCoordsSchema = z.infer<typeof ZCityCoordsSchema>
