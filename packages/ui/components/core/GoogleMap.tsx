/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { rem, Skeleton } from '@mantine/core'
import { GoogleMap as GMap, Marker, type MarkerProps, useJsApiLoader } from '@react-google-maps/api'
import { getBounds } from 'geolib'
import { memo, useCallback } from 'react'

import { trpc as api } from '~ui/lib/trpcClient'

export const GoogleMapComponent = ({ height, width, locationIds }: GoogleMapProps) => {
	const { data, isLoading } = api.location.forGoogleMaps.useQuery(locationIds)

	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string,
	})
	const getBoundProps = () => {
		if (Array.isArray(data)) {
			const coords: { latitude: number; longitude: number }[] = []
			for (const { latitude, longitude } of data) {
				if (!latitude || !longitude) continue
				coords.push({ longitude, latitude })
			}
			const bounds = getBounds(coords)
			return new google.maps.LatLngBounds(
				{ lat: bounds.minLat, lng: bounds.minLng },
				{ lat: bounds.maxLat, lng: bounds.minLng }
			)
		}
		throw new Error('Must have multiple points')
	}

	const getMarkers = () => {
		if (Array.isArray(data)) {
			return data.map(({ latitude, longitude }, idx) => {
				if (!latitude || !longitude) return null
				const props: MarkerProps = {
					position: {
						lat: latitude,
						lng: longitude,
					},
				}
				return <Marker key={idx} {...props} />
			})
		}
		if (!data?.latitude || !data?.longitude) return null
		const props: MarkerProps = {
			position: {
				lat: data.latitude,
				lng: data.longitude,
			},
		}
		return <Marker {...props} />
	}

	// const RenderMap = () => {
	const onLoad = useCallback(function onLoad(map: google.maps.Map) {
		map.setOptions({ disableDefaultUI: true, keyboardShortcuts: false })

		if (Array.isArray(data)) {
			map.fitBounds(getBoundProps())
		} else {
			if (data?.latitude && data?.longitude) {
				const center = new google.maps.LatLng({ lat: data.latitude, lng: data.longitude })
				map.setCenter(center)
				map.setZoom(11)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return isLoaded || !isLoading ? (
		<GMap mapContainerStyle={{ height, width, borderRadius: rem(16) }} onLoad={onLoad}>
			{getMarkers()}
		</GMap>
	) : (
		<Skeleton h={height} w={width} radius={16} />
	)
}

export const GoogleMap = memo(GoogleMapComponent)

interface GoogleMapProps {
	locationIds: string | string[]
	height: number
	width: number
}
