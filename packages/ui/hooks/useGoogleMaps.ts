import { type Group as TweenGroup } from '@tweenjs/tween.js'
import { useContext } from 'react'

import { GoogleMapContext, type MapEvents, type MarkerState } from '~ui/providers/GoogleMaps'

export const useGoogleMaps = (): UseGoogleMapsReturn => {
	const context = useContext(GoogleMapContext)
	if (!context) {
		throw new Error('useGoogleMaps must be used within a GoogleMapsProvider')
	}
	if (context.isReady) {
		return {
			map: context.map,
			infoWindow: context.infoWindow,
			mapIsReady: true,
			mapEvents: context.mapEvents,
			camera: context.camera,
			marker: context.marker,
			tweenGroup: context.tweenGroup,
		}
	} else {
		return {
			map: undefined,
			infoWindow: undefined,
			mapIsReady: false,
			mapEvents: context.mapEvents,
			camera: context.camera,
			marker: context.marker,
			tweenGroup: context.tweenGroup,
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
	tweenGroup: TweenGroup
}
interface MapIsReady {
	map: google.maps.Map
	infoWindow: google.maps.InfoWindow
	mapIsReady: true
	mapEvents: MapEvents
	camera: google.maps.CameraOptions
	marker: MarkerState
	tweenGroup: TweenGroup
}
type UseGoogleMapsReturn = MapNotReady | MapIsReady
