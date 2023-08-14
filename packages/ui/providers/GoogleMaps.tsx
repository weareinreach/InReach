import { useEventEmitter, useMap } from 'ahooks'
import { type EventEmitter } from 'ahooks/lib/useEventEmitter'
import { createContext, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

export const GoogleMapContext = createContext<GoogleMapContextValue | null>(null)
GoogleMapContext.displayName = 'GoogleMapContext'

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
	const [map, setMap] = useState<google.maps.Map>()
	const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>()
	const [isReady, setIsReady] = useState(false)
	const [markers, marker] = useMap<string, google.maps.Marker>()

	const mapEvents = {
		ready: useEventEmitter<boolean>(),
		initialPropsSet: useEventEmitter<boolean>(),
	}
	const mapEventRef = useRef<MapEvents>(mapEvents)
	const initialCamera = useMemo(() => {
		return {
			center: map?.getCenter()?.toJSON() ?? { lat: 39.8283, lng: -98.5795 },
			zoom: map?.getZoom() ?? 4,
		}
	}, [map])

	const cameraRef = useRef<google.maps.CameraOptions>(initialCamera)

	mapEventRef.current.ready.useSubscription((val) => {
		setIsReady(val)
	})

	useEffect(() => {
		if (map && infoWindow) {
			const infoListener = google.maps.event.addListener(infoWindow, 'closeclick', () => {
				if (cameraRef.current.center) map.panTo(cameraRef.current.center)
			})
			const mapListener = google.maps.event.addListener(map, 'click', () => {
				infoWindow.close()
				if (cameraRef.current.center) map.panTo(cameraRef.current.center)
			})
			markers.forEach((marker) => marker.setMap(map))

			return () => {
				google.maps.event.removeListener(infoListener)
				google.maps.event.removeListener(mapListener)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map, infoWindow])
	const contextValue = {
		map,
		infoWindow,
		setMap,
		setInfoWindow,
		isReady,
		mapEvents,
		camera: cameraRef.current,
		marker,
		markers,
	}

	return <GoogleMapContext.Provider value={contextValue}>{children}</GoogleMapContext.Provider>
}

export interface MapEvents {
	ready: EventEmitter<boolean>
	initialPropsSet: EventEmitter<boolean>
}
export interface MarkerState {
	set: (key: string, value: google.maps.Marker) => void
	setAll: (value: Iterable<readonly [string, google.maps.Marker]>) => void
	get: (key: string) => google.maps.Marker | undefined
	remove: (key: string) => void
	reset: () => void
}

interface GoogleMapContextValue {
	map: google.maps.Map | undefined
	infoWindow: google.maps.InfoWindow | undefined
	setMap: (map: google.maps.Map) => void
	setInfoWindow: (infoWindow: google.maps.InfoWindow) => void
	isReady: boolean
	mapEvents: MapEvents
	camera: google.maps.CameraOptions
	marker: MarkerState
	markers: Map<string, google.maps.Marker>
}
