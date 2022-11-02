import { z } from 'zod'

/** GeoJSON Object definition */

// const allowedTypes = ['Point', 'Polygon', 'MultiPolygon'] as const

/** [Longitude, Latitude] */
const coordTuple = z.tuple([z.number(), z.number()])

/** Coordinate format: [Longitude, Latitude] */
export type GeoJSON = z.infer<typeof GeoJSONSchema>
/** Coordinate format: [Longitude, Latitude] */
export const GeoJSONSchema = z.object({
	type: z.string(),
	geometry: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('Point'),
			coordinates: coordTuple,
		}),
		z.object({
			type: z.literal('Polygon'),
			coordinates: coordTuple.array(),
		}),
		z.object({
			type: z.literal('MultiPolygon'),
			coordinates: coordTuple.array().array(),
		}),
	]),
})
