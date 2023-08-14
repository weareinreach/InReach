import { MantineProvider, Stack, Text, Title } from '@mantine/core'
import { useRouter } from 'next/router'
import { type Route } from 'nextjs-routes'
import { createRoot } from 'react-dom/client'

import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useGoogleMaps } from '~ui/hooks/useGoogleMaps'
import { appCache, appTheme } from '~ui/theme'

const getHref: GetHref = ({ slug, locationId }) => {
	if (slug && locationId) {
		return {
			pathname: '/org/[slug]/[orgLocationId]',
			query: { slug, orgLocationId: locationId },
		}
	}
	return {
		pathname: '/org/[slug]',
		query: { slug },
	}
}
type SlugOnly = {
	slug: string
	locationId?: undefined
}
type LocationAndSlug = {
	slug: string
	locationId: string
}
type GetHref = (params: SlugOnly | LocationAndSlug) => Route
export const useGoogleMapMarker = () => {
	const router = useRouter()
	const variant = useCustomVariant()
	const { mapIsReady, infoWindow, marker, map } = useGoogleMaps()
	return {
		get(id: string) {
			return marker.get(id)
		},
		add({ id, lat, lng, name, address, slug, locationId }: AddMarkerParams) {
			if (!mapIsReady) throw new Error('map is not ready')
			const position = new google.maps.LatLng({ lat, lng })
			const newMarker = marker.get(id) ?? new google.maps.Marker()

			newMarker.setMap(map)
			newMarker.setPosition(position)

			const infoBoxNode = document.createElement('div')
			infoBoxNode.id = id
			const infoBoxContent = createRoot(infoBoxNode)

			infoBoxContent.render(
				<MantineProvider withGlobalStyles withNormalizeCSS theme={{ ...appTheme }} emotionCache={appCache}>
					<Stack spacing={4}>
						{slug ? (
							<Link
								variant={variant.Link.inlineUtil1}
								onClick={() => router.push(getHref({ slug, locationId }))}
							>
								<Title order={3}>{name}</Title>
							</Link>
						) : (
							<Title order={3}>{name}</Title>
						)}
						{address && <Text>{Array.isArray(address) ? address.join('\n') : address}</Text>}
					</Stack>
				</MantineProvider>
			)
			if (mapIsReady) {
				newMarker.addListener('click', () => {
					infoWindow.setContent(infoBoxNode)
					infoWindow.open(map, newMarker)
				})
			}
			marker.set(id, newMarker)
			return newMarker
		},
		remove(markerId: string) {
			const markerItem = marker.get(markerId)
			if (!markerItem) return false
			markerItem.setMap(null)
			google.maps.event.clearInstanceListeners(markerItem)
			marker.remove(markerId)
			return true
		},
	}
}

interface AddMarkerParams {
	id: string
	lat: number
	lng: number
	name: string
	address?: string | string[]
	slug?: string
	locationId?: string
	map: google.maps.Map
}
