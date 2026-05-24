import { z } from 'zod'

/**
 * V2 Schema for Empowered Search Includes parameters for user-led prioritization and weighted scoring.
 */
export const ZSearchDistanceSchemaV2 = z.object({
	lat: z.number().gte(-90).lte(90),
	lon: z.number().gte(-180).lte(180),
	dist: z.coerce.number().default(50), // Smart default
	unit: z.enum(['mi', 'km']),
	skip: z.coerce.number().default(0),
	take: z.coerce.number().default(25),
	services: z.string().array().optional(),
	attributes: z.string().array().optional(),
	priorityTags: z.record(z.string(), z.number().min(1).max(5)).optional(),
	sortBias: z.enum(['DISTANCE', 'RELEVANCE']).default('DISTANCE'),
	matchMode: z.enum(['AND', 'OR']).default('AND'),
	includeNational: z.boolean().default(false),
})

export type TSearchDistanceSchemaV2 = z.infer<typeof ZSearchDistanceSchemaV2>
