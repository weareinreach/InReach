import { z } from 'zod'

export const ZSearchDistanceAdvSchema = z.object({
	lat: z.number().gte(-90).lte(90),
	lon: z.number().gte(-180).lte(180),
	dist: z.coerce.number().default(200),
	unit: z.enum(['mi', 'km']),
	skip: z.coerce.number().default(0),
	take: z.coerce.number().default(25),
	services: z.string().array().optional(),
	attributes: z.string().array().optional(),
	// Advanced/V2 specific parameters
	version: z.literal('v2'),
	focuses: z.string().array().optional().default([]), // Now sent as an ordered list of active IDs
	sortBias: z.enum(['DISTANCE', 'RELEVANCE']).optional().default('DISTANCE'),
})

export type TSearchDistanceAdvSchema = z.infer<typeof ZSearchDistanceAdvSchema>
