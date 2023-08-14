import { useContext } from 'react'

import { GoogleMapContext, type MapEvents, type MarkerState } from '~ui/providers/GoogleMaps'

export const useGoogleMaps = (): UseGoogleMapsReturn => {
	const context = useContext(GoogleMapContext)
	if (!context) {
		throw new Error('useGoogleMaps must be used within a GoogleMapsProvider')
	}
	if (context.map && context.isReady && context.infoWindow) {
		return {
			map: context.map,
			infoWindow: context.infoWindow,
			mapIsReady: true,
			mapEvents: context.mapEvents,
			camera: context.camera,
			marker: context.marker,
		}
	} else {
		return {
			map: undefined,
			infoWindow: undefined,
			mapIsReady: false,
			mapEvents: context.mapEvents,
			camera: context.camera,
			marker: context.marker,
		}
	}
}
export const useGoogleMapSetup = () => {
	const context = useContext(GoogleMapContext)
	if (!context) {
		throw new Error('useGoogleMapSetup must be used within a GoogleMapsProvider')
	}
	return {
		map: context.map,
		setMap: context.setMap,
		setInfoWindow: context.setInfoWindow,
		mapEvents: context.mapEvents,
		mapIsReady: context.isReady,
		camera: context.camera,
	}
}

interface MapNotReady {
	map: undefined
	infoWindow: undefined
	mapIsReady: false
	mapEvents: MapEvents
	camera: google.maps.CameraOptions
	marker: MarkerState
}
interface MapIsReady {
	map: google.maps.Map
	infoWindow: google.maps.InfoWindow
	mapIsReady: true
	mapEvents: MapEvents
	camera: google.maps.CameraOptions
	marker: MarkerState
}
type UseGoogleMapsReturn = MapNotReady | MapIsReady
