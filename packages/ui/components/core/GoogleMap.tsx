/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { Skeleton, rem } from '@mantine/core'
import { GoogleMap as GMap, useJsApiLoader, Marker, MarkerProps } from '@react-google-maps/api'
import { getBounds } from 'geolib'
import { useCallback, memo } from 'react'
import { ApiOutput } from '@weareinreach/api'

export const _GoogleMap = ({ height, width, marker }: GoogleMapProps) => {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string,
	})
	const getBoundProps = () => {
		if (Array.isArray(marker)) {
			const coords: { latitude: number; longitude: number }[] = []
			for (const { latitude, longitude } of marker) {
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
		if (Array.isArray(marker)) {
			return marker.map(({ latitude, longitude }, idx) => {
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
		if (!marker.latitude || !marker.longitude) return null
		const props: MarkerProps = {
			position: {
				lat: marker.latitude,
				lng: marker.longitude,
			},
		}
		return <Marker {...props} />
	}

	// const RenderMap = () => {
	const onLoad = useCallback(function onLoad(map: google.maps.Map) {
		map.setOptions({ disableDefaultUI: true, keyboardShortcuts: false })

		if (Array.isArray(marker)) {
			map.fitBounds(getBoundProps())
		} else {
			if (marker.latitude && marker.longitude) {
				const center = new google.maps.LatLng({ lat: marker.latitude, lng: marker.longitude })
				map.setCenter(center)
				map.setZoom(11)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return isLoaded ? (
		<GMap mapContainerStyle={{ height, width, borderRadius: rem(16) }} onLoad={onLoad}>
			{getMarkers()}
		</GMap>
	) : (
		<Skeleton h={height} w={width} radius={16} />
	)
}

export const GoogleMap = memo(_GoogleMap)

type Location =
	| NonNullable<ApiOutput['organization']['getBySlug']>['locations'][number]
	| NonNullable<ApiOutput['location']['getById']>
interface GoogleMapProps {
	marker: Location | Location[]
	height: number
	width: number
}
