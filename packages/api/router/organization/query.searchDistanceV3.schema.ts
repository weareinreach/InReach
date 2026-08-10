import { z } from 'zod'

export const ZSearchDistanceV3Schema = z.object({
	lat: z.number().gte(-90).lte(90),
	lon: z.number().gte(-180).lte(180),
	dist: z.coerce.number().default(200),
	unit: z.enum(['mi', 'km']),
	skip: z.coerce.number().default(0),
	take: z.coerce.number().default(25),
	services: z.string().array().optional(),
	attributes: z.string().array().optional(),
	// V3 specific parameters
	version: z.literal('v3'),
	focuses: z.string().array().optional().default([]), // Now sent as an ordered list of active IDs
	sortBias: z.enum(['DISTANCE', 'RELEVANCE']).optional().default('DISTANCE'),
})

export type TSearchDistanceV3Schema = z.infer<typeof ZSearchDistanceV3Schema>
