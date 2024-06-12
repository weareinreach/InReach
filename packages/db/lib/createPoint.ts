import { geojsonToWKT } from '@terraformer/wkt'
import { point } from '@turf/helpers'
import { z } from 'zod'

import { Prisma } from '~db/client'
import { GeoJSONPointSchema, latitude, longitude } from '~db/zod_util'

export const createPoint = ({ longitude: lon, latitude: lat }: CreatePointArgs) => {
	if (!lon || !lat) {
		return 'JsonNull'
	}
	return point([lon, lat]).geometry
}
export const createPointOrNull = ({ longitude: lon, latitude: lat }: CreatePointArgs) => {
	if (!lon || !lat) {
		return Prisma.JsonNull
	}
	return point([lon, lat]).geometry
}

const GeoSchema = z.object({ latitude, longitude })

export const createGeoFields = (
	{ longitude: lon, latitude: lat }: CreatePointArgs,
	opts?: CreateGeoFieldsOpts
) => {
	const parsed = GeoSchema.safeParse({ latitude: lat, longitude: lon })

	if (!parsed.success) {
		return {}
	}

	const geom = point([parsed.data.longitude, parsed.data.latitude]).geometry

	return {
		...(opts?.excludeLatLon ? {} : { latitude: parsed.data.latitude, longitude: parsed.data.longitude }),
		...(opts?.excludeWKT ? {} : { geoWKT: geojsonToWKT(geom) }),
		...(opts?.excludeGeoJSON ? {} : { geoJSON: GeoJSONPointSchema.parse(geom) }),
	}
}

interface CreatePointArgs {
	longitude: number | undefined
	latitude: number | undefined
}

interface CreateGeoFieldsOpts {
	excludeLatLon?: boolean
	excludeWKT?: boolean
	excludeGeoJSON?: boolean
}
