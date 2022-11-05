import { z } from 'zod'

/** Coordinates must be greater than or equal to -180 and less than or equal to 180. */
const coordinate = z.number().gte(-180).lte(180)
/** [Longitude, Latitude] Coordinates must be greater than or equal to -180 and less than or equal to 180. */
const coordTuple = z.tuple([coordinate, coordinate])

const FeatureSchema = z.object({
	type: z.literal('Feature'),
	/**
	 * @param geometry - “GeoJSON Geometry” refers to any of the single geometry objects from the geoJSON
	 *   specification.
	 * @param geometry.type - Currently supported: **Point**, **Polygon**, or **MultiPolygon**.
	 */
	geometry: z.discriminatedUnion('type', [
		z.object({
			/** An object representing a single point. */
			type: z.literal('Point'),
			/**
			 * [Longitude, Latitude]
			 *
			 * Coordinates must be greater than or equal to -180 and less than or equal to 180.
			 */
			coordinates: coordTuple,
		}),
		z.object({
			/** An array of coordinates defining a polygon. */
			type: z.literal('Polygon'),
			/**
			 * [[Longitude, Latitude], [Longitude, Latitude],...]
			 *
			 * Polygon must have a **minimum** of **4** coordinate pairs.
			 *
			 * Coordinates must be greater than or equal to **-180** and less than or equal to **180**.
			 */
			coordinates: coordTuple.array().min(4),
		}),
		z.object({
			/** An object that represents multiple polygons in a single object. */
			type: z.literal('MultiPolygon'),
			/**
			 * [[[Longitude, Latitude],...], [[Longitude, Latitude],...], ...]
			 *
			 * MultiPolygons are an array of at least **2** polygons.
			 *
			 * Polygon must have a **minimum** of **4** coordinate pairs.
			 *
			 * Coordinates must be greater than or equal to **-180** and less than or equal to **180**.
			 */
			coordinates: coordTuple.array().min(4).array(),
			/**
			 * A GeoJSON bounding box is usually a 4-item array representing the rectangle that will contain the
			 * GeoJSON object.
			 */
			bbox: coordinate.array().min(4).optional(),
		}),
	]),
	/** @param properties - Any misc metadata */
	properties: z.record(z.any()).optional(),
})

const FeatureCollectionSchema = z.object({
	/** Can be either 'FeatureCollection' or 'Feature' */
	type: z.literal('FeatureCollection'),
	features: FeatureSchema.array(),
})

export type GeoJSON = z.infer<typeof GeoJSONSchema>

/**
 * Define a GeoJSON object.
 *
 * @param type - Can be either "FeatureCollection" or "Feature"
 */
export const GeoJSONSchema = z.discriminatedUnion('type', [FeatureCollectionSchema, FeatureSchema])
