import { type Meta, type StoryObj } from '@storybook/nextjs'
import { useEffect } from 'react'
import { action } from 'storybook/actions'

import { useGoogleMapMarker } from '~ui/hooks/useGoogleMapMarker'
import { useGoogleMaps } from '~ui/hooks/useGoogleMaps'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { trpc as api } from '~ui/lib/trpcClient'

import { GoogleMap, type GoogleMapProps } from './GoogleMap'

const MapWithMarkers = ({ locationIds, height, width }: GoogleMapProps) => {
	const mapMarker = useGoogleMapMarker()
	const { map, mapIsReady } = useGoogleMaps()
	const actionLogger = action('Map marker ->')
	const { data, isLoading } = api.location.forGoogleMaps.useQuery(
		{ locationIds: Array.isArray(locationIds) ? locationIds : [locationIds] },
		{ enabled: !!map && !!mapMarker }
	)
	useEffect(() => {
		if (!isLoading && data && mapIsReady) {
			for (const location of data.locations) {
				actionLogger({
					id: location.id,
					name: location.name ?? '',
					lat: location.latitude ?? 0,
					lng: location.longitude ?? 0,
				})
				try {
					// Google's marker library can throw internally when the map failed to fully
					// initialize (e.g. an API key without Advanced Markers/vector-map access, as in
					// this Storybook environment) - matches the same try/catch guard already used
					// around `mapMarker.add` in the production call site (LocationCard.tsx).
					mapMarker.add({
						map,
						id: location.id,
						name: location.name ?? '',
						lat: location.latitude ?? 0,
						lng: location.longitude ?? 0,
					})
				} catch (error) {
					console.warn('Failed to add map marker', error)
				}
			}
			return () => {
				for (const location of data.locations) {
					mapMarker.remove(location.id)
				}
			}
		}
		return void 0
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, data, mapIsReady])

	return <GoogleMap {...{ locationIds, height, width }} />
}

export default {
	title: 'Design System/Google Map',
	component: MapWithMarkers,
	args: {
		width: 500,
		height: 500,
	},
	parameters: {
		// layoutWrapper: 'gridSingle',
		wdyr: { trackAllPureComponents: true },
	},
} satisfies Meta<typeof GoogleMap>

type StoryDef = StoryObj<typeof GoogleMap>
export const SingleLocation = {
	beforeEach({ msw }) {
		msw.use(
			getTRPCMock({
				path: ['location', 'forGoogleMaps'],
				response: {
					locations: [
						{
							id: 'oloc_01GVH3VEVBERFNA9PHHJYEBGA3',
							name: 'Whitman-Walker 1525',
							latitude: 38.91,
							longitude: -77.032,
						},
					],
					bounds: null,
					center: {
						lat: 38.91,
						lng: -77.032,
					},
					zoom: 13,
				},
			})
		)
	},

	args: {
		locationIds: 'oloc_01GVH3VEVBERFNA9PHHJYEBGA3',
	},
} satisfies StoryDef
export const MultipleLocations = {
	args: {
		locationIds: [
			'oloc_01GVH3VFDP0W49EXHYR31N862K',
			'oloc_01GVH3VFDPV2KQYZ3HWX4DABQJ',
			'oloc_01GVH3VFDPYPNQDWZEGHW9QWM9',
		],
	},

	beforeEach({ msw }) {
		msw.use(
			getTRPCMock({
				path: ['location', 'forGoogleMaps'],
				response: {
					locations: [
						{
							id: 'oloc_01GVH3VFDP0W49EXHYR31N862K',
							name: 'Los Angeles Office',
							latitude: 34.062,
							longitude: -118.306,
						},
						{
							id: 'oloc_01GVH3VFDPV2KQYZ3HWX4DABQJ',
							name: 'New York City Office',
							latitude: 40.705,
							longitude: -74.011,
						},
						{
							id: 'oloc_01GVH3VFDPYPNQDWZEGHW9QWM9',
							name: 'Washington, D.C. Office',
							latitude: 38.907,
							longitude: -77.037,
						},
					],
					bounds: {
						north: 40.705,
						east: -74.011,
						south: 34.062,
						west: -118.306,
					},
					center: {
						lat: 37.3835,
						lng: -96.1585,
					},
					zoom: null,
				},
			})
		)
	},
} satisfies StoryDef
