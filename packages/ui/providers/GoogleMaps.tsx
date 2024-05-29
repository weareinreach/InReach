import { Group as TweenGroup } from '@tweenjs/tween.js'
import { useEventEmitter, useMap } from 'ahooks'
import { type EventEmitter } from 'ahooks/lib/useEventEmitter'
import { createContext, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

export const GoogleMapContext = createContext<GoogleMapContext | null>(null)
GoogleMapContext.displayName = 'GoogleMapContext'

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
	const [map, setMap] = useState<google.maps.Map>()
	const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>()
	const [isReady, setIsReady] = useState(false)
	const [markers, marker] = useMap<string, google.maps.marker.AdvancedMarkerElement>()
	const eventEmitter = useEventEmitter<boolean>()
	const mapEvents = useMemo(
		() => ({
			ready: eventEmitter,
			initialPropsSet: eventEmitter,
		}),
		[eventEmitter]
	)
	const mapEventRef = useRef<MapEvents>(mapEvents)
	const initialCamera = useMemo(() => {
		return {
			center: map?.getCenter()?.toJSON() ?? { lat: 39.8283, lng: -98.5795 },
			zoom: map?.getZoom() ?? 4,
		}
	}, [map])

	const cameraRef = useRef<google.maps.CameraOptions>(initialCamera)
	const tweenGroup = useMemo(() => new TweenGroup(), [])
	mapEventRef.current.ready.useSubscription((val) => {
		setIsReady(val)
	})

	useEffect(() => {
		if (map && infoWindow) {
			const infoListener = google.maps.event.addListener(infoWindow, 'closeclick', () => {
				if (cameraRef.current.center) {
					map.panTo(cameraRef.current.center)
				}
			})
			const mapListener = google.maps.event.addListener(map, 'click', () => {
				infoWindow.close()
				if (cameraRef.current.center) {
					map.panTo(cameraRef.current.center)
				}
			})
			markers.forEach((singleMarker) => (singleMarker.map = map))

			return () => {
				google.maps.event.removeListener(infoListener)
				google.maps.event.removeListener(mapListener)
			}
		}
		return () => void 0
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map, infoWindow])

	const mapIsReady = typeof map !== 'undefined' && typeof infoWindow !== 'undefined'

	const contextValue: ContextValue<boolean> = useMemo(
		() =>
			mapIsReady && isReady
				? {
						map,
						infoWindow,
						setMap,
						setInfoWindow,
						mapEvents,
						marker,
						markers,
						isReady,
						tweenGroup,
						camera: cameraRef.current,
					}
				: {
						setMap,
						setInfoWindow,
						mapEvents,
						marker,
						markers,
						tweenGroup,
						isReady: false,
						map: undefined,
						infoWindow: undefined,
						camera: cameraRef.current,
					},
		[infoWindow, map, mapEvents, mapIsReady, marker, markers, isReady, tweenGroup]
	)
	return <GoogleMapContext.Provider value={contextValue}>{children}</GoogleMapContext.Provider>
}

export interface MapEvents {
	ready: EventEmitter<boolean>
	initialPropsSet: EventEmitter<boolean>
}
export interface MarkerState {
	set: (key: string, value: google.maps.marker.AdvancedMarkerElement) => void
	setAll: (value: Iterable<readonly [string, google.maps.marker.AdvancedMarkerElement]>) => void
	get: (key: string) => google.maps.marker.AdvancedMarkerElement | undefined
	remove: (key: string) => void
	reset: () => void
}

interface GoogleMapContextBase {
	setMap: (map: google.maps.Map) => void
	setInfoWindow: (infoWindow: google.maps.InfoWindow) => void
	mapEvents: MapEvents
	camera: google.maps.CameraOptions
	marker: MarkerState
	markers: Map<string, google.maps.marker.AdvancedMarkerElement>
	tweenGroup: TweenGroup
}

interface GoogleMapReadyContext extends GoogleMapContextBase {
	map: google.maps.Map
	infoWindow: google.maps.InfoWindow
	isReady: true
}
interface GoogleMapNotReadyContext extends GoogleMapContextBase {
	map: undefined
	infoWindow: undefined
	isReady: false
}

type GoogleMapContext = GoogleMapReadyContext | GoogleMapNotReadyContext
type ContextValue<TReady extends boolean> = TReady extends true
	? GoogleMapReadyContext
	: GoogleMapNotReadyContext
