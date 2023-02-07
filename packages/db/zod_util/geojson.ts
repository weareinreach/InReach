import { Prisma } from '@prisma/client'
import { z } from 'zod'

/** Longitudes are vertical lines that measure east or west of the meridian in Greenwich, England */
const longitude = z.number().gte(-180).lte(180)
/** Latitudes are horizontal lines that measure distance north or south of the equator. */
const latitude = z.number().gte(-90).lte(90)
/** [Longitude, Latitude] */
const coordTuple = z.tuple([longitude, latitude])
const polygon = coordTuple.array().min(4).array()

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
			 * [**Longitude**, **Latitude**]
			 *
			 * **Longitudes** are vertical lines that measure east or west of the meridian in Greenwich, England.
			 *
			 * **Latitudes** are horizontal lines that measure distance north or south of the equator.
			 */
			coordinates: coordTuple,
		}),
		z.object({
			/** An array of coordinates defining a polygon. */
			type: z.literal('Polygon'),
			/**
			 * [[**Longitude**, **Latitude**], [**Longitude**, **Latitude**],...]
			 *
			 * Polygon must have a **minimum** of **4** coordinate pairs.
			 *
			 * **Longitudes** are vertical lines that measure east or west of the meridian in Greenwich, England.
			 *
			 * **Latitudes** are horizontal lines that measure distance north or south of the equator.
			 */
			coordinates: polygon,
		}),
		z.object({
			/** An object that represents multiple polygons in a single object. */
			type: z.literal('MultiPolygon'),
			/**
			 * [[[**Longitude**, **Latitude**],...], [[**Longitude**, **Latitude**],...], ...]
			 *
			 * MultiPolygons are an array of at least **2** polygons.
			 *
			 * Polygon must have a **minimum** of **4** coordinate pairs.
			 *
			 * **Longitudes** are vertical lines that measure east or west of the meridian in Greenwich, England.
			 *
			 * **Latitudes** are horizontal lines that measure distance north or south of the equator.
			 */
			coordinates: polygon.array(),
			/**
			 * A GeoJSON bounding box is usually a 4-item array representing the rectangle that will contain the
			 * GeoJSON object.
			 */
			bbox: longitude.or(latitude).optional(),
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
export const GeoJSONSchema: z.ZodType<Prisma.InputJsonValue> = z.discriminatedUnion('type', [
	FeatureCollectionSchema,
	FeatureSchema,
])

export const GeoJSONPointSchema: z.ZodType<Prisma.InputJsonValue> = z.object({
	type: z.literal('Feature'),
	geometry: z.object({
		type: z.literal('Point'),
		coordinates: coordTuple,
	}),
})
