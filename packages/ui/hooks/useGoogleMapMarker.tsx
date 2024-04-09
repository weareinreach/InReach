import { MantineProvider, Stack, Text, Title } from '@mantine/core'
import { useWhyDidYouUpdate } from 'ahooks'
import { useRouter } from 'next/router'
import { type Route } from 'nextjs-routes'
import { useCallback, useMemo } from 'react'
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
	locationId?: never
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
	const markerInfoBoxLinkClickHandler = useCallback(
		({ slug, locationId }: SlugOnly | LocationAndSlug) =>
			() =>
				router.push(getHref({ slug, locationId })),
		[router]
	)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getMarker = useCallback((id: string) => marker.get(id), [])
	const addMarker = useCallback(
		({ id, lat, lng, name, address, slug, locationId }: AddMarkerParams) => {
			if (!mapIsReady) {
				throw new Error('map is not ready')
			}
			console.trace('adding new marker', { id, lat, lng, name, address, slug, locationId })
			const position = new google.maps.LatLng({ lat, lng })
			const newMarker = marker.get(id) ?? new google.maps.marker.AdvancedMarkerElement()

			// console.trace('adding new marker', name, position.toString())
			newMarker.map = map
			newMarker.position = position

			const infoBoxNode = document.createElement('div')
			infoBoxNode.id = id
			const infoBoxContent = createRoot(infoBoxNode)

			infoBoxContent.render(
				<MantineProvider withGlobalStyles withNormalizeCSS theme={{ ...appTheme }} emotionCache={appCache}>
					<Stack spacing={4}>
						{slug ? (
							<Link
								variant={variant.Link.inlineUtil1}
								onClick={markerInfoBoxLinkClickHandler({ slug, locationId })}
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[infoWindow, map, mapIsReady, markerInfoBoxLinkClickHandler]
	)

	const removeMarker = useCallback(
		(markerId: string) => {
			const markerItem = marker.get(markerId)
			if (!markerItem) {
				return false
			}
			markerItem.map = null
			google.maps.event.clearInstanceListeners(markerItem)
			marker.remove(markerId)
			return true
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	)
	const markerFns = useMemo(
		() => ({ get: getMarker, add: addMarker, remove: removeMarker }),
		[addMarker, getMarker, removeMarker]
	)
	useWhyDidYouUpdate('useGoogleMapMarker', {
		router,
		infoWindow,
		map,
		mapIsReady,
		clickHandler: markerInfoBoxLinkClickHandler,
	})

	return markerFns
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
