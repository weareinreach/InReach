import { z } from 'zod'

/** Longitudes are vertical lines that measure east or west of the meridian in Greenwich, England */
const longitude = z
	.union([z.number(), z.string()])
	.pipe(z.coerce.number().gte(-180).lte(180).describe('longitude'))
/** Latitudes are horizontal lines that measure distance north or south of the equator. */
const latitude = z
	.union([z.number(), z.string()])
	.pipe(z.coerce.number().gte(-90).lte(90).describe('latitude'))

/**
 * Search Params
 *
 * `[iso_country_code, longitude, latitude, radius, unit]`
 */
export const SearchParamsSchema = z
	.tuple([
		z.string().length(2),
		longitude,
		latitude,
		z.union([z.number(), z.string()]).pipe(z.coerce.number().gte(0).describe('radius')),
		z.enum(['mi', 'km']),
	])
	.transform<[string, string, string, string, 'mi' | 'km']>(([country, lon, lat, radius, unit]) => [
		country,
		lon.toString(),
		lat.toString(),
		radius.toString(),
		unit,
	])
