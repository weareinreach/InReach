import { Card, Divider, Group, List, Stack, Title, useMantineTheme } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { Easing, getAll as getAllTweens, Tween } from '@tweenjs/tween.js'
import compact from 'just-compact'
import parsePhoneNumber, { type CountryCode } from 'libphonenumber-js'
import { formatAddress } from 'localized-address-format'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useMemo, useRef, useState } from 'react'

import { BadgeGroup } from '~ui/components/core/Badge'
import { Link } from '~ui/components/core/Link'
import { Rating } from '~ui/components/core/Rating'
import { useCustomVariant } from '~ui/hooks'
import { useGoogleMapMarker } from '~ui/hooks/useGoogleMapMarker'
import { useGoogleMaps } from '~ui/hooks/useGoogleMaps'
import { type IconList } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

let runningAnimation: number
const stopAnimations = (animationProcess: number) => {
	cancelAnimationFrame(animationProcess)
	const tweens = getAllTweens()
	for (const instance of tweens) {
		instance.stop()
	}
}

export const LocationCard = ({ remoteOnly, locationId }: LocationCardProps) => {
	const { map, mapIsReady, mapEvents, camera } = useGoogleMaps()
	const [marker, setMarker] = useState<google.maps.Marker>()
	const [initialPosition, setInitialPosition] = useState<google.maps.CameraOptions>()
	const [canGetCenter, setCanGetCenter] = useState(map?.getCenter() !== undefined)

	const cardRef = useRef<HTMLDivElement>(null)
	const router = useRouter<'/org/[slug]'>()
	const variants = useCustomVariant()
	const { t } = useTranslation(['gov-dist', 'common'])
	const { ref: addressRef, height: addressListHeight } = useElementSize()
	const theme = useMantineTheme()
	const mapMarker = useGoogleMapMarker()
	const { data: orgId } = api.organization.getIdFromSlug.useQuery(
		{ slug: router.query.slug ?? '' },
		{ enabled: router.isReady }
	)
	const { data } = api.location.forLocationCard.useQuery(locationId ?? '', {
		enabled: !remoteOnly,
	})
	const { data: remoteServices, isLoading: remoteIsLoading } = api.service.forServiceInfoCard.useQuery(
		{ parentId: orgId?.id ?? '', remoteOnly },
		{ enabled: remoteOnly && orgId?.id !== undefined }
	)
	const formattedAddressParts = useMemo(() => {
		const adminArea = data?.govDist?.abbrev
			? data.govDist.abbrev
			: data?.govDist?.tsKey
			? (t(data.govDist.tsKey, { ns: data.govDist.tsNs }) satisfies string)
			: undefined

		return formatAddress({
			addressLines: compact([data?.street1?.trim(), data?.street2?.trim()]),
			locality: data?.city.trim(),
			postalCode: data?.postCode ? data.postCode.trim() : undefined,
			postalCountry: data?.country,
			administrativeArea: adminArea,
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	mapEvents.initialPropsSet.useSubscription((val) => {
		setCanGetCenter(val)
	})

	useEffect(() => {
		if (mapIsReady && data && map && data.latitude && data.longitude && canGetCenter) {
			const newMarker = mapMarker.add({
				map,
				id: data.id,
				name: data.name ?? '',
				lat: data.latitude,
				lng: data.longitude,
				address: formattedAddressParts,
				slug: router.query.slug,
				locationId: data.id,
			})
			setMarker(newMarker)
			setInitialPosition({
				center: map.getCenter()?.toJSON(),
				zoom: map.getZoom(),
			})
			return () => {
				mapMarker.remove(newMarker)
				setMarker(undefined)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, mapIsReady, formattedAddressParts, router.query.slug, canGetCenter])
	useEffect(() => {
		if (marker && cardRef.current && mapIsReady && data?.latitude && data?.longitude && initialPosition) {
			const card = cardRef.current
			const locationCoords = new google.maps.LatLng({ lat: data.latitude, lng: data.longitude })
			const originalView: google.maps.CameraOptions = {
				center: map.getCenter()?.toJSON(),
				zoom: map.getZoom(),
			}
			const locationView: google.maps.CameraOptions = {
				center: locationCoords.toJSON(),
				zoom: 15,
			}

			const zoomIn = new Tween(camera)
				.to(locationView, 2000)
				.easing(Easing.Quadratic.Out)
				.onUpdate(() => {
					map.moveCamera(camera)
				})
			const zoomOut = new Tween(camera)
				.to(originalView, 2000)
				.easing(Easing.Quadratic.Out)
				.onUpdate(() => {
					map.moveCamera(camera)
				})

			const animateIn = async (time: number) => {
				runningAnimation = requestAnimationFrame(animateIn)
				setTimeout(() => zoomIn.update(time), 80)
			}
			const animateOut = async (time: number) => {
				runningAnimation = requestAnimationFrame(animateOut)
				setTimeout(() => zoomOut.update(time), 80)
			}
			const enterEvent = () => {
				stopAnimations(runningAnimation)
				zoomIn.start()
				runningAnimation = requestAnimationFrame(animateIn)
			}
			const exitEvent = () => {
				stopAnimations(runningAnimation)
				zoomOut.start()
				runningAnimation = requestAnimationFrame(animateOut)
			}

			card.addEventListener('mouseenter', enterEvent)
			card.addEventListener('mouseleave', exitEvent)

			return () => {
				card.removeEventListener('mouseenter', enterEvent)
				card.removeEventListener('mouseleave', exitEvent)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, mapIsReady, marker, map])

	const remoteReady = remoteOnly && remoteServices?.length && !remoteIsLoading

	if (remoteReady) {
		const remoteServCategories = [
			...new Set(remoteServices.flatMap(({ serviceCategories }) => serviceCategories)),
		]

		return (
			<Link
				href={{
					pathname: '/org/[slug]/remote',
					query: {
						slug: router.query.slug ?? '',
					},
				}}
				variant={variants.Link.card}
			>
				<Card w='100%' variant={variants.Card.hoverCoolGray}>
					<Stack spacing={32}>
						<Stack spacing={12}>
							<Title order={2}>{t('common:remote-services')}</Title>
						</Stack>
						<Stack spacing={12}>
							<Title order={3}>{t('services', { ns: 'common' })}</Title>
							<BadgeGroup
								badges={remoteServCategories.map((tsKey) => ({
									variant: 'service',
									tsKey,
								}))}
							/>
						</Stack>

						<Group spacing={24}>
							<BadgeGroup
								badges={[
									{
										variant: 'attribute',
										tsNs: 'attribute',
										tsKey: 'additional.offers-remote-services',
										icon: 'carbon:globe',
									},
								]}
							/>
						</Group>
					</Stack>
				</Card>
			</Link>
		)
	}

	if (!data) return null

	const adminArea = data.govDist?.abbrev
		? data.govDist.abbrev
		: data.govDist?.tsKey
		? (t(data.govDist.tsKey, { ns: data.govDist.tsNs }) satisfies string)
		: undefined

	const formattedAddress = formatAddress({
		addressLines: compact([data.street1?.trim(), data.street2?.trim()]),
		locality: data.city.trim(),
		postalCode: data.postCode ? data.postCode.trim() : undefined,
		postalCountry: data.country,
		administrativeArea: adminArea,
	}).join(', ')

	const primaryPhone = data.phones.find((phone) => Boolean(phone.primary)) ?? data.phones[0]

	const parsedPhone = primaryPhone
		? parsePhoneNumber(primaryPhone.number, primaryPhone.country as CountryCode)
		: undefined
	const formattedPhone = parsedPhone ? parsedPhone.formatNational() : undefined

	const isAddressSingleLine = addressListHeight > 36
	const addressListVariant = isAddressSingleLine
		? variants.List.inlineUtil2DarkGray
		: variants.List.inlineBulletUtil2DarkGray
	const separator = (
		<Divider w={4} size={4} style={{ borderRadius: '50%' }} color={theme.other.colors.secondary.darkGray} />
	)
	const listProps = { variant: addressListVariant, icon: separator, ref: addressRef }

	const hasServices = Boolean(data.services.length)
	const hasAttributes = Boolean(data.attributes.length)

	return (
		<Link
			href={{
				pathname: '/org/[slug]/[orgLocationId]',
				query: {
					slug: router.query.slug ?? '',
					orgLocationId: data.id,
				},
			}}
			variant={variants.Link.card}
		>
			<Card w='100%' variant={variants.Card.hoverCoolGray} ref={cardRef}>
				<Stack spacing={32}>
					<Stack spacing={12}>
						<Title order={2}>{data.name}</Title>
						<List {...listProps}>
							<List.Item>{formattedAddress}</List.Item>
							{formattedPhone && <List.Item>{formattedPhone}</List.Item>}
						</List>
					</Stack>
					{hasServices && (
						<Stack spacing={12}>
							<Title order={3}>{t('services', { ns: 'common' })}</Title>
							<BadgeGroup
								badges={data.services.map((tsKey) => ({
									variant: 'service',
									tsKey,
								}))}
							/>
						</Stack>
					)}
					<Group spacing={24}>
						{hasAttributes && (
							<BadgeGroup
								badges={data.attributes.map((attribute) => ({
									variant: 'attribute',
									tsNs: attribute.tsNs,
									tsKey: attribute.tsKey,
									icon: attribute.icon as IconList,
								}))}
							/>
						)}
						<Rating hideCount recordId={data.id} />
					</Group>
				</Stack>
			</Card>
		</Link>
	)
}

export type LocationCardProps = LocationProps | RemoteProps
interface LocationProps {
	locationId: string
	remoteOnly?: false
}
interface RemoteProps {
	locationId?: never
	remoteOnly: true
}
