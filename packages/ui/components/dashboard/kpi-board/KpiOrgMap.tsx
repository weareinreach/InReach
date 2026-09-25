import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { Status, Wrapper } from '@googlemaps/react-wrapper'
import { Skeleton } from '@mantine/core'
import { useCallback, useEffect, useRef } from 'react'

import { MapRenderer } from '~ui/components/core/GoogleMap'
import { useGoogleMaps } from '~ui/hooks/useGoogleMaps'

export interface KpiOrgMapMarker {
	orgId: string
	locationId: string
	slug: string
	name: string
	latitude: number
	longitude: number
	status: 'good' | 'needs_review' | 'critical'
}

export interface KpiOrgMapProps {
	height: number
	width: number
	markers: KpiOrgMapMarker[]
	onMarkerClick: (marker: KpiOrgMapMarker) => void
}

/**
 * KPI Board's map layer - built additively alongside `GoogleMap.tsx` rather than modifying it, since that
 * component is coupled to a `locationIds`-driven query and used elsewhere in the app. Reuses its exported
 * `MapRenderer` (the bare map+InfoWindow canvas) for the actual Google Maps instantiation, then manages its
 * own markers/clustering on top - `useGoogleMapMarker` isn't reused here because it sets `marker.map`
 * directly, which conflicts with MarkerClusterer's own ownership of when a marker is added to/removed from
 * the map. See docs/Dashboards/KpiBoard/README.md.
 */
const MarkerLayer = ({ markers, onMarkerClick }: Pick<KpiOrgMapProps, 'markers' | 'onMarkerClick'>) => {
	const { map, mapIsReady } = useGoogleMaps()
	const clustererRef = useRef<MarkerClusterer | undefined>(undefined)
	const onMarkerClickRef = useRef(onMarkerClick)
	onMarkerClickRef.current = onMarkerClick

	useEffect(() => {
		if (!mapIsReady || !map) {
			return
		}
		const markerElements = markers
			.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
			.map((item) => {
				const markerEl = new google.maps.marker.AdvancedMarkerElement({
					position: { lat: item.latitude, lng: item.longitude },
					title: item.name,
				})
				markerEl.addListener('click', () => onMarkerClickRef.current(item))
				return markerEl
			})

		if (markerElements.length) {
			const bounds = new google.maps.LatLngBounds()
			for (const markerEl of markerElements) {
				if (markerEl.position) {
					bounds.extend(markerEl.position)
				}
			}
			map.fitBounds(bounds)
		}

		clustererRef.current?.clearMarkers()
		clustererRef.current = new MarkerClusterer({ map, markers: markerElements })

		return () => {
			clustererRef.current?.clearMarkers()
			clustererRef.current = undefined
		}
	}, [map, mapIsReady, markers])

	return null
}

export const KpiOrgMap = ({ height, width, markers, onMarkerClick }: KpiOrgMapProps) => {
	const renderMap = useCallback(
		(status: Status) => {
			switch (status) {
				case Status.LOADING:
					return <Skeleton h={height} w={width} radius={16} />
				case Status.FAILURE:
					return <></>
				case Status.SUCCESS:
					return (
						<>
							<MapRenderer height={height} width={width} />
							<MarkerLayer markers={markers} onMarkerClick={onMarkerClick} />
						</>
					)
				default:
					return <></>
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- markers/onMarkerClick handled inside MarkerLayer, not the Wrapper's own render callback
		[height, width]
	)

	return (
		<Wrapper
			// eslint-disable-next-line node/no-process-env
			apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string}
			render={renderMap}
			libraries={['core', 'maps', 'marker']}
			id='google-map'
			version='weekly'
		/>
	)
}
