/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { Status, Wrapper } from '@googlemaps/react-wrapper'
import { rem, Skeleton } from '@mantine/core'
import { memo, useEffect, useRef } from 'react'

import { useGoogleMaps, useGoogleMapSetup } from '~ui/hooks/useGoogleMaps'
import { trpc as api } from '~ui/lib/trpcClient'

const MapRenderer = memo(({ height, width }: MapRendererProps) => {
	const { setMap, setInfoWindow, mapEvents } = useGoogleMapSetup()
	const mapRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (mapRef.current) {
			const newMap = new google.maps.Map(mapRef.current, {
				disableDefaultUI: true,
				mapId: 'cd9fc3a944b18418',
				isFractionalZoomEnabled: true,
			})
			const newInfoWindow = new google.maps.InfoWindow()

			setMap(newMap)
			setInfoWindow(newInfoWindow)
			mapEvents.ready.emit(true)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return <div ref={mapRef} style={{ height, width, borderRadius: rem(16) }} />
})

MapRenderer.displayName = 'GoogleMapRenderer'
export const GoogleMap = ({ height, width, locationIds }: GoogleMapProps) => {
	const { map, mapIsReady, mapEvents, camera } = useGoogleMaps()
	const { data, isLoading } = api.location.forGoogleMaps.useQuery(
		{ locationIds: Array.isArray(locationIds) ? locationIds : [locationIds] },
		{ enabled: mapIsReady }
	)

	useEffect(() => {
		if (mapIsReady && !isLoading && data) {
			const { bounds, center, zoom } = data
			if (zoom) {
				map.setZoom(zoom)
			}
			if (center) {
				map.setCenter(center)
			}
			if (bounds) {
				map.fitBounds(bounds)
				map.panToBounds(bounds)
				if ((map.getZoom() ?? 0) > 16) {
					map.setZoom(16)
				}
			}
			camera.center = center
			camera.zoom = zoom ?? map.getZoom()
			mapEvents.initialPropsSet.emit(true)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapIsReady, map, isLoading, data])

	const mapRender = (status: Status) => {
		switch (status) {
			case Status.LOADING: {
				return <Skeleton h={height} w={width} radius={16} />
			}
			case Status.FAILURE: {
				return <></>
			}
			case Status.SUCCESS: {
				return <MapRenderer {...{ height, width }} />
			}
		}
	}

	return (
		<Wrapper
			apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string}
			render={mapRender}
			libraries={['core', 'maps', 'marker']}
			id='google-map'
			version='weekly'
		/>
	)
}

GoogleMap.displayName = '@weareinreach/ui/components/core/GoogleMap'

export interface GoogleMapProps {
	locationIds: string | string[]
	height: number
	width: number
}

type MapRendererProps = Omit<GoogleMapProps, 'locationIds'>
