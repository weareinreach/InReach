import { geojsonToWKT } from '@terraformer/wkt'
import { point } from '@turf/helpers'
import { z } from 'zod'

import { Prisma } from '~db/client'
import { GeoJSONPointSchema, latitude, longitude } from '~db/zod_util'

export const createPoint = ({ longitude, latitude }: CreatePointArgs) => {
	if (!longitude || !latitude) return 'JsonNull'
	return point([longitude, latitude]).geometry
}
export const createPointOrNull = ({ longitude, latitude }: CreatePointArgs) => {
	if (!longitude || !latitude) return Prisma.JsonNull
	return point([longitude, latitude]).geometry
}

const GeoSchema = z.object({ latitude, longitude })

export const createGeoFields = ({ longitude, latitude }: CreatePointArgs, opts?: CreateGeoFieldsOpts) => {
	const parsed = GeoSchema.safeParse({ latitude, longitude })

	if (!parsed.success) return {}

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
