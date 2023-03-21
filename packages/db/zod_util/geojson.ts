import { Prisma } from '@prisma/client'
import { z } from 'zod'

/** Longitudes are vertical lines that measure east or west of the meridian in Greenwich, England */
const longitude = z.number().gte(-180).lte(180)
/** Latitudes are horizontal lines that measure distance north or south of the equator. */
const latitude = z.number().gte(-90).lte(90)
/** [Longitude, Latitude] */
const coordTuple = z.tuple([longitude, latitude])
const polygon = coordTuple.array().min(4).array()

export const Geometry = z.discriminatedUnion('type', [
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
])

const FeatureSchema = z.object({
	type: z.literal('Feature'),
	/**
	 * @param geometry - “GeoJSON Geometry” refers to any of the single geometry objects from the geoJSON
	 *   specification.
	 * @param geometry.type - Currently supported: **Point**, **Polygon**, or **MultiPolygon**.
	 */
	geometry: Geometry,
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

// export const GeoJSONPointSchema: z.ZodType<Prisma.InputJsonValue> = z.object({
// 	type: z.literal('Feature'),
// 	geometry: z.object({
// 		type: z.literal('Point'),
// 		coordinates: coordTuple,
// 	}),
// })
export const GeoJSONPointSchema: z.ZodType<Prisma.InputJsonValue> = z.object({
	type: z.literal('Point'),
	coordinates: coordTuple,
})

export const GeometryJSONfile = z.object({ geometry: Geometry }).transform(({ geometry }) => geometry)

export const CountyUSData = z.object({
	type: z.string(),
	features: z.array(
		z.object({
			type: z.literal('Feature'),
			properties: z.object({
				GEO_ID: z.string(),
				STATE: z.string(),
				COUNTY: z.string(),
				NAME: z.string(),
				LSAD: z.union([
					z.literal('Borough'),
					z.literal('CA'),
					z.literal('city'),
					z.literal('County'),
					z.literal('Cty&Bor'),
					z.literal(''),
					z.literal('Muny'),
					z.literal('Parish'),
				]),
				CENSUSAREA: z.number(),
			}),
			geometry: z.object({
				type: z.union([z.literal('MultiPolygon'), z.literal('Polygon')]),
				coordinates: z.array(z.array(z.array(z.union([z.array(z.number()), z.number()])))),
			}),
		})
	),
})
export const CityUSData = z.object({
	type: z.string(),
	features: z.array(
		z.object({
			type: z.literal('Feature'),
			geometry: z.object({
				type: z.literal('Point'),
				coordinates: z.array(z.number()),
			}),
			properties: z.object({
				name: z.string(),
				'country.etc': z.string(),
				pop: z.string(),
				capital: z.string(),
			}),
		})
	),
})
export const StateUSData = z.object({
	type: z.string(),
	features: z.array(
		z.object({
			type: z.literal('Feature'),
			properties: z.object({
				GEO_ID: z.string(),
				STATE: z.string(),
				NAME: z.string(),
				LSAD: z.string(),
				CENSUSAREA: z.number(),
			}),
			geometry: z.object({
				type: z.union([z.literal('MultiPolygon'), z.literal('Polygon')]),
				coordinates: z.array(z.array(z.array(z.union([z.array(z.number()), z.number()])))),
			}),
		})
	),
})
export const CityCAData = z.object({
	type: z.string(),
	name: z.string(),
	features: z.array(
		z.object({
			type: z.literal('Feature'),
			properties: z.object({
				city: z.string(),
				city_ascii: z.string(),
				province_id: z.string(),
				province_name: z.string(),
				lat: z.number(),
				lng: z.number(),
				population: z.string(),
				density: z.string(),
				timezone: z.string(),
				ranking: z.string(),
				postal: z.string(),
				id: z.string(),
			}),
			geometry: z.object({
				type: z.literal('Point'),
				coordinates: z.array(z.number()),
			}),
		})
	),
})
export const ProvinceCAData = z.object({
	type: z.string(),
	features: z.array(
		z.object({
			type: z.literal('Feature'),
			geometry: z.object({
				coordinates: z.array(z.array(z.array(z.union([z.array(z.number()), z.number()])))),
				type: z.union([z.literal('MultiPolygon'), z.literal('Polygon')]),
			}),
			properties: z.object({
				prov_type: z.union([z.literal('province'), z.literal('territory / territoire')]),
				prov_code: z.string(),
				prov_name_fr: z.string(),
				geo_point_2d: z.array(z.number()),
				prov_name_en: z.string(),
				year: z.string(),
				prov_area_code: z.literal('CAN'),
			}),
		})
	),
})
export const StateMXData = z.object({
	type: z.string(),
	features: z.array(
		z.object({
			type: z.literal('Feature'),
			geometry: z.object({
				type: z.literal('MultiPolygon'),
				coordinates: z.array(z.array(z.array(z.array(z.number())))),
			}),
			properties: z.object({
				objectid: z.number(),
				fips_admin: z.string(),
				gmi_admin: z.string(),
				admin_name: z.string(),
				fips_cntry: z.literal('MX'),
				gmi_cntry: z.literal('MEX'),
				cntry_name: z.literal('Mexico'),
				pop_admin: z.number(),
				type_eng: z.union([z.literal('Federal District'), z.literal('State')]),
				type_loc: z.union([z.literal('Distrito Federal'), z.literal('Estado')]),
				sqkm: z.number(),
				sqmi: z.number(),
				color_map: z.string(),
				shape_leng: z.number(),
				shape_area: z.number(),
				cartodb_id: z.number(),
				created_at: z.string(),
				updated_at: z.string(),
			}),
		})
	),
})
export const CityMXData = z.object({
	type: z.string(),
	name: z.string(),
	crs: z.object({
		type: z.string(),
		properties: z.object({
			name: z.string(),
		}),
	}),
	features: z.array(
		z.object({
			type: z.literal('Feature'),
			properties: z.object({
				city: z.string(),
				lat: z.number(),
				lng: z.number(),
				country: z.literal('Mexico'),
				iso2: z.literal('MX'),
				admin_name: z.string(),
				capital: z.union([z.literal('admin'), z.literal(''), z.literal('minor'), z.literal('primary')]),
				population: z.string(),
				population_proper: z.string(),
			}),
			geometry: z.object({
				type: z.literal('Point'),
				coordinates: z.array(z.number()),
			}),
		})
	),
})

export const CountyPRData = z.object({
	type: z.string(),
	features: z.array(
		z.object({
			type: z.literal('Feature'),
			properties: z.object({
				GEO_ID: z.string(),
				STATE: z.string(),
				COUNTY: z.string(),
				NAME: z.string(),
				LSAD: z.literal('Muno'),
				CENSUSAREA: z.number(),
			}),
			geometry: z.object({
				type: z.union([z.literal('MultiPolygon'), z.literal('Polygon')]),
				coordinates: z.array(z.array(z.array(z.union([z.array(z.number()), z.number()])))),
			}),
		})
	),
})
