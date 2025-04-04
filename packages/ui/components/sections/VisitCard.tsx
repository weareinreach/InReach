import { Card, createStyles, Group, rem, Stack, Text, Title, Tooltip, useMantineTheme } from '@mantine/core'
import { useElementSize, useMediaQuery } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'
import invariant from 'tiny-invariant'

import { AddressVisibility } from '@weareinreach/db/enums'
import { Badge } from '~ui/components/core/Badge'
import { GoogleMap } from '~ui/components/core/GoogleMap'
import { Link } from '~ui/components/core/Link'
import { AddressDrawer } from '~ui/components/data-portal/AddressDrawer'
import { useCustomVariant, useFormattedAddress, useScreenSize } from '~ui/hooks'
import { useGoogleMapMarker } from '~ui/hooks/useGoogleMapMarker'
import { useGoogleMaps } from '~ui/hooks/useGoogleMaps'
import { Icon, validateIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

export const VisitCard = ({ edit = false, ...props }: VisitCardProps & { edit?: boolean }) =>
	edit ? <VisitCardEdit {...props} /> : <VisitCardDisplay {...props} />

const VisitCardDisplay = ({ locationId }: VisitCardProps) => {
	const { isMobile } = useScreenSize()
	const { t } = useTranslation(['common', 'attribute'])
	const { ref, width } = useElementSize()
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const mapMarker = useGoogleMapMarker()
	const { map, mapIsReady } = useGoogleMaps()
	const { data } = api.location.forVisitCard.useQuery(locationId)

	const formattedAddress = useFormattedAddress(data)
	const hasMapData = !!data?.latitude && !!data?.longitude && !!data?.name
	useEffect(() => {
		if (map && mapIsReady && hasMapData) {
			const lat = data?.latitude
			const lng = data?.longitude
			const name = data?.name
			try {
				invariant(lat)
				invariant(lng)
				invariant(name)
				invariant(formattedAddress)

				mapMarker.add({
					map,
					lat,
					lng,
					name,
					id: locationId,
					address: formattedAddress,
				})
				return () => {
					mapMarker.remove(locationId)
				}
			} catch (error) {
				console.error(error)
				return void 0
			}
		}
		return () => void 0
	}, [
		data?.name,
		data?.latitude,
		data?.longitude,
		formattedAddress,
		map,
		mapIsReady,
		locationId,
		mapMarker,
		hasMapData,
	])

	// const isAccessible = location.attributes.some(
	// 	(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	// )

	if (!data) {
		return null
	}

	const address = formattedAddress && (
		<Stack spacing={12} ref={ref}>
			<Title order={3}>
				{t(hasMapData ? 'words.address' : 'words.location', {
					context: data.remote ? 'physical' : undefined,
				})}
			</Title>
			<Text>{formattedAddress}</Text>
			{hasMapData && <GoogleMap locationIds={data.id} height={Math.floor(width * 0.625)} width={width} />}
		</Stack>
	)

	const remoteSection = data.remote && (
		<Stack spacing={12}>
			<Badge.Attribute icon={validateIcon(data.remote.icon)}>
				{t(data.remote.tsKey, { ns: 'attribute' })}
			</Badge.Attribute>
			<Text variant={variants.Text.utility2}>{t('remote-services')}</Text>
		</Stack>
	)

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('visit')}</Title>
			{address}
			{remoteSection}
			{/* <Hours parentId={locationId} /> */}
			{/* TODO: [IN-807] Validate accessibility data points before enabling.
			<Stack spacing={12} align='flex-start'>
				<Badge
					variant='attribute'
					tsNs='attribute'
					tsKey='additional.wheelchair-accessible'
					tProps={{ context: `${isAccessible}` }}
					icon={isAccessible ? 'carbon:accessibility' : 'carbon:warning'}
					style={{ marginLeft: 0 }}
				/>
				<Text variant={variants.Text.utility2}>
					{t('accessible-building', { context: `${isAccessible}` })}
				</Text>
			</Stack> */}
		</Stack>
	)
	if (!formattedAddress && !data.hasHours) {
		return null
	}

	return isTablet ? body : <Card>{body}</Card>
}

const useEditStyles = createStyles((theme) => ({
	overlay: {
		backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.9),
		borderRadius: rem(16),
		margin: rem(-8),
	},
	overlayInner: {
		padding: rem(8),
	},
}))
const VisitCardEdit = ({ locationId }: VisitCardProps) => {
	const { isMobile } = useScreenSize()
	const { classes } = useEditStyles()
	const { t } = useTranslation(['common', 'attribute'])
	const { ref, width } = useElementSize()
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const mapMarker = useGoogleMapMarker()
	const { map, mapIsReady } = useGoogleMaps()
	const { data } = api.location.forVisitCardEdits.useQuery(locationId)

	const formattedAddress = useFormattedAddress(data)
	const hasMapData = !!data?.latitude && !!data?.longitude && !!data?.name
	useEffect(() => {
		if (map && mapIsReady && hasMapData) {
			const { name, latitude: lat, longitude: lng } = data ?? {}
			try {
				invariant(lat)
				invariant(lng)
				invariant(name)
				invariant(formattedAddress)

				mapMarker.add({
					map,
					lat,
					lng,
					name,
					id: locationId,
					address: formattedAddress,
				})
				return () => {
					mapMarker.remove(locationId)
				}
			} catch (error) {
				console.error(error)
				return void 0
			}
		}
		return () => void 0
	}, [data, formattedAddress, map, mapIsReady, locationId, mapMarker, hasMapData])

	// const isAccessible = location.attributes.some(
	// 	(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	// )

	if (!data) {
		return null
	}

	const addressHiddenIcon = (
		<Tooltip label='Address is hidden' withinPortal>
			<Icon icon='carbon:view-off' />
		</Tooltip>
	)

	const address = formattedAddress && (
		<Stack spacing={12} ref={ref}>
			<Title order={3}>
				{t(hasMapData ? 'words.address' : 'words.location', {
					context: data.remote ? 'physical' : undefined,
				})}
			</Title>
			<Group>
				{data.addressVisibility === AddressVisibility.HIDDEN && addressHiddenIcon}
				<AddressDrawer
					locationId={locationId}
					external
					component={Link}
					variant={variants.Link.inlineInverted}
					className={classes.overlay}
				>
					<Text className={classes.overlayInner}>{formattedAddress}</Text>
				</AddressDrawer>
			</Group>
			{hasMapData && <GoogleMap locationIds={data.id} height={Math.floor(width * 0.625)} width={width} />}
		</Stack>
	)

	const remoteSection = data.remote && (
		<Stack spacing={12}>
			<Badge.Attribute icon={validateIcon(data.remote.icon)}>
				{t(data.remote.tsKey, { ns: 'attribute' })}
			</Badge.Attribute>
			<Text variant={variants.Text.utility2}>{t('remote-services')}</Text>
		</Stack>
	)

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('visit')}</Title>
			{address}
			{remoteSection}
			{/* <Hours parentId={locationId} edit /> */}
		</Stack>
	)

	return isTablet ? body : <Card>{body}</Card>
}

export interface VisitCardProps {
	locationId: string
}
