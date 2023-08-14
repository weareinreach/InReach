import { TRPCError } from '@trpc/server'
import { getBounds, getCenterOfBounds } from 'geolib'

import { prisma } from '@weareinreach/db'
import { globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForGoogleMapsSchema } from './query.forGoogleMaps.schema'

const getBoundary = (coords: { latitude: number; longitude: number }[]): google.maps.LatLngBoundsLiteral => {
	const bounds = getBounds(coords)
	return {
		north: bounds.maxLat,
		east: bounds.maxLng,
		south: bounds.minLat,
		west: bounds.minLng,
	}
}
const getCenter = (coords: { latitude: number; longitude: number }[]): google.maps.LatLngLiteral => {
	const center = getCenterOfBounds(coords)
	return { lat: center.latitude, lng: center.longitude }
}

export const forGoogleMaps = async ({ input }: TRPCHandlerParams<TForGoogleMapsSchema>) => {
	const result = await prisma.orgLocation.findMany({
		where: {
			...globalWhere.isPublic(),
			id: { in: Array.isArray(input.locationIds) ? input.locationIds : [input.locationIds] },
			AND: [{ latitude: { not: 0 } }, { longitude: { not: 0 } }],
		},
		select: {
			id: true,
			name: true,
			latitude: true,
			longitude: true,
		},
	})
	if (!result.length) {
		throw new TRPCError({ code: 'NOT_FOUND' })
	}
	const coordsForBounds: { latitude: number; longitude: number }[] = []

	for (const { latitude, longitude } of result) {
		if (latitude && longitude) coordsForBounds.push({ latitude, longitude })
	}
	const bounds = result.length > 1 ? getBoundary(coordsForBounds) : null
	const center =
		result.length === 1 && result.at(0)?.latitude && result.at(0)?.longitude
			? ({ lat: result.at(0)!.latitude, lng: result.at(0)!.longitude } as { lat: number; lng: number })
			: getCenter(coordsForBounds)
	const zoom = result.length === 1 ? 17 : null

	return {
		locations: result,
		bounds,
		center,
		zoom,
	}
}
