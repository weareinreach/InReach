import { Card, Divider, Group, List, Stack, Title, useMantineTheme } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { Easing, Tween } from '@tweenjs/tween.js'
import compact from 'just-compact'
import parsePhoneNumber, { type CountryCode } from 'libphonenumber-js'
import { formatAddress } from 'localized-address-format'
import { useRouter } from 'next/router'
import { type TFunction, useTranslation } from 'next-i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import { type SetNonNullable } from 'type-fest'

import { type ApiOutput } from '@weareinreach/api'
import { Badge } from '~ui/components/core/Badge'
import { Link } from '~ui/components/core/Link'
import { Rating } from '~ui/components/core/Rating'
import { useCustomVariant } from '~ui/hooks'
import { useGoogleMapMarker } from '~ui/hooks/useGoogleMapMarker'
import { useGoogleMaps } from '~ui/hooks/useGoogleMaps'
import { Icon, type IconList } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const getAdminArea = (data: ApiOutput['location']['forLocationCard'] | undefined, t: TFunction) => {
	if (data?.govDist?.abbrev) {
		return data.govDist.abbrev
	}
	if (data?.govDist?.tsKey) {
		return t(data.govDist.tsKey, { ns: data.govDist.tsNs })
	}
	return undefined
}
const hasData = (
	data: ApiOutput['location']['forLocationCard'] | undefined
): data is ApiOutput['location']['forLocationCard'] => !!data
const hasCoords = (
	data: ApiOutput['location']['forLocationCard'] | undefined
): data is SetNonNullable<ApiOutput['location']['forLocationCard'], 'latitude' | 'longitude'> =>
	!!data?.latitude && !!data?.longitude

export const LocationCard = ({ remoteOnly, locationId, edit }: LocationCardProps) => {
	const { map, mapIsReady, mapEvents, camera, tweenGroup } = useGoogleMaps()
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
	const { data } = api.location.forLocationCard.useQuery(
		{ id: locationId ?? '', isEditMode: edit },
		{
			enabled: !remoteOnly,
		}
	)
	const { data: remoteServices, isLoading: remoteIsLoading } = api.service.forServiceInfoCard.useQuery(
		{ parentId: orgId?.id ?? '', remoteOnly },
		{ enabled: remoteOnly && orgId?.id !== undefined }
	)
	const formattedAddressParts = useMemo(() => {
		const administrativeArea = getAdminArea(data, t)

		return formatAddress({
			addressLines: compact([data?.street1?.trim(), data?.street2?.trim()]),
			locality: data?.city?.trim(),
			postalCode: data?.postCode ? data.postCode.trim() : undefined,
			postalCountry: data?.country,
			administrativeArea,
		})
	}, [data, t])

	mapEvents.initialPropsSet.useSubscription((val) => {
		setCanGetCenter(val)
		if (map) {
			const initPosition = {
				center: map.getCenter()?.toJSON(),
				zoom: map.getZoom(),
			}
			setInitialPosition(initPosition)
		}
	})

	const mapMarkerData = useMemo(() => {
		if (!mapIsReady || !map || !hasData(data) || !canGetCenter) {
			return null
		}
		if (!hasCoords(data)) {
			return null
		}

		return {
			map,
			id: data.id,
			name: data.name ?? '',
			lat: data.latitude,
			lng: data.longitude,
			address: formattedAddressParts,
			slug: router.query.slug,
			locationId: data.id,
		}
	}, [mapIsReady, map, data, canGetCenter, formattedAddressParts, router.query.slug])

	useEffect(() => {
		try {
			invariant(mapMarkerData)
			mapMarker.add(mapMarkerData)
			return () => {
				mapMarker.remove(mapMarkerData.id)
			}
		} catch {
			return void 0
		}
	}, [mapMarker, mapMarkerData])

	const stopAnimations = useCallback(() => {
		const tweens = tweenGroup.getAll()
		for (const instance of tweens) {
			if (instance.isPlaying()) {
				instance.stop()
			}
		}
	}, [tweenGroup])
	const createTweens = useCallback(() => {
		try {
			invariant(locationId)
			invariant(map)
			invariant(data?.latitude)
			invariant(data?.longitude)
			invariant(initialPosition)
			const marker = mapMarker.get(locationId)
			invariant(marker)
			const locationCoords = new google.maps.LatLng({ lat: data.latitude, lng: data.longitude })
			const locationView: google.maps.CameraOptions = {
				center: locationCoords.toJSON(),
				zoom: 17,
			}
			const zoomIn = new Tween(camera, tweenGroup)
				.to(locationView, 2000)
				.easing(Easing.Quadratic.Out)
				.onUpdate((cameraOptions) => {
					map.moveCamera(cameraOptions)
				})
				.dynamic(true)

			const zoomOut = new Tween(camera, tweenGroup)
				.to(initialPosition, 2000)
				.easing(Easing.Quadratic.Out)
				.onUpdate((cameraOptions) => {
					map.moveCamera(cameraOptions)
				})
				.dynamic(true)

			const animateIn = () => {
				if (zoomIn.isPlaying()) {
					requestAnimationFrame(animateIn)
					zoomIn.update()
				}
			}
			const animateOut = () => {
				if (zoomOut.isPlaying()) {
					requestAnimationFrame(animateOut)
					zoomOut.update()
				}
			}
			const enterEvent = () => {
				stopAnimations()
				zoomIn.start()
				requestAnimationFrame(animateIn)
			}
			const exitEvent = () => {
				stopAnimations()
				zoomOut.start()
				requestAnimationFrame(animateOut)
			}
			return { enter: enterEvent, exit: exitEvent }
		} catch {
			return null
		}
	}, [
		camera,
		data?.latitude,
		data?.longitude,
		initialPosition,
		locationId,
		map,
		mapMarker,
		tweenGroup,
		stopAnimations,
	])

	useEffect(() => {
		try {
			const card = cardRef.current
			const tweenEvents = createTweens()
			invariant(card)
			invariant(tweenEvents)
			const { enter, exit } = tweenEvents
			card.addEventListener('mouseenter', enter)
			card.addEventListener('mouseleave', exit)

			return () => {
				card.removeEventListener('mouseenter', enter)
				card.removeEventListener('mouseleave', exit)
			}
		} catch {
			return () => void 0
		}
	}, [cardRef, createTweens])

	const getTextVariant = useMemo(() => {
		if (data?.deleted) {
			return variants.Title.darkGrayStrikethru
		}
		if (!data?.published) {
			return variants.Title.darkGray
		}
		return undefined
	}, [data, variants])

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
							<Badge.Group>
								{remoteServCategories.map((tsKey) => (
									<Badge.Service key={tsKey}>{t(tsKey, { ns: 'services' })}</Badge.Service>
								))}
							</Badge.Group>
						</Stack>

						<Group spacing={24}>
							<Badge.Group>
								<Badge.Attribute icon='carbon:globe'>
									{t('additional.offers-remote-services', { ns: 'attribute' })}
								</Badge.Attribute>
							</Badge.Group>
						</Group>
					</Stack>
				</Card>
			</Link>
		)
	}

	if (!data) {
		return null
	}

	const adminArea = getAdminArea(data, t)

	const formattedAddress = formatAddress({
		addressLines: compact([data.street1?.trim(), data.street2?.trim()]),
		locality: data.city?.trim(),
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
	console.log('title variant', getTextVariant)
	return (
		<Link
			href={{
				pathname: edit ? '/org/[slug]/[orgLocationId]/edit' : '/org/[slug]/[orgLocationId]',
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
						<Group>
							<Title order={2} variant={getTextVariant}>
								{data.name}
							</Title>
							{!data.published && <Icon icon='carbon:view-off-filled' />}
							{data.deleted && <Icon icon='carbon:trash-can' />}
						</Group>
						{((!data.notVisitable && formattedAddress) || formattedPhone) && (
							<List {...listProps}>
								{!data.notVisitable && <List.Item>{formattedAddress}</List.Item>}
								{formattedPhone && <List.Item>{formattedPhone}</List.Item>}
							</List>
						)}
					</Stack>
					{hasServices && (
						<Stack spacing={12}>
							<Title order={3}>{t('services', { ns: 'common' })}</Title>
							<Badge.Group>
								{data.services.map((tsKey) => (
									<Badge.Service key={tsKey}>{t(tsKey, { ns: 'services' })}</Badge.Service>
								))}
							</Badge.Group>
						</Stack>
					)}
					<Group spacing={24}>
						{hasAttributes && (
							<Badge.Group>
								{data.attributes.map((attribute) => (
									<Badge.Attribute icon={attribute.icon as IconList} key={attribute.tsKey}>
										{t(attribute.tsKey, { ns: attribute.tsNs })}
									</Badge.Attribute>
								))}
							</Badge.Group>
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
	edit?: boolean
}
interface RemoteProps {
	locationId?: never
	remoteOnly: true
	edit?: boolean
}
