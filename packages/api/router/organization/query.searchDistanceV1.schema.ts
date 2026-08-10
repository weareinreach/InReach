import { z } from 'zod'

export const ZSearchDistanceV1Schema = z.object({
	lat: z.number().gte(-90).lte(90),
	lon: z.number().gte(-180).lte(180),
	dist: z.coerce.number(),
	unit: z.enum(['mi', 'km']),
	skip: z.coerce.number(),
	take: z.coerce.number(),
	services: z.string().array().optional(),
	attributes: z.string().array().optional(),
})
export type TSearchDistanceV1Schema = z.infer<typeof ZSearchDistanceV1Schema>
