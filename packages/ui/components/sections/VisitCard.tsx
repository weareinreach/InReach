import { Card, createStyles, rem, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useElementSize, useMediaQuery } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'

import { Badge } from '~ui/components/core/Badge'
import { GoogleMap } from '~ui/components/core/GoogleMap'
import { Link } from '~ui/components/core/Link'
import { Hours } from '~ui/components/data-display/Hours'
import { AddressDrawer } from '~ui/components/data-portal/AddressDrawer'
import { useCustomVariant, useFormattedAddress, useScreenSize } from '~ui/hooks'
import { useGoogleMapMarker } from '~ui/hooks/useGoogleMapMarker'
import { useGoogleMaps } from '~ui/hooks/useGoogleMaps'
import { validateIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

export const VisitCard = (props: VisitCardProps) =>
	props.edit ? <VisitCardEdit {...props} /> : <VisitCardDisplay {...props} />

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

	useEffect(() => {
		if (data?.latitude && data?.longitude && data?.name && formattedAddress && mapIsReady && map) {
			mapMarker.add({
				map,
				id: locationId,
				lat: data.latitude,
				lng: data.longitude,
				name: data.name,
				address: formattedAddress,
			})
		}
		return () => {
			mapMarker.remove(locationId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.name, data?.latitude, data?.longitude, formattedAddress, map, mapIsReady, locationId])

	// const isAccessible = location.attributes.some(
	// 	(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	// )

	if (!data) {
		return null
	}

	const address = formattedAddress && (
		<Stack spacing={12} ref={ref}>
			<Title order={3}>{t('address', { context: data.remote ? 'physical' : undefined })}</Title>
			<Text>{formattedAddress}</Text>
			<GoogleMap locationIds={data.id} height={Math.floor(width * 0.625)} width={width} />
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
			<Hours parentId={locationId} />
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

	return isTablet ? body : <Card>{body}</Card>
}
// TODO: [IN-785] Create variant for Remote/Unpublished address

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
	useEffect(() => {
		if (data?.latitude && data?.longitude && data?.name && formattedAddress && mapIsReady && map) {
			mapMarker.add({
				map,
				id: locationId,
				lat: data.latitude,
				lng: data.longitude,
				name: data.name,
				address: formattedAddress,
			})
		}
		return () => {
			mapMarker.remove(locationId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.name, data?.latitude, data?.longitude, formattedAddress, map, mapIsReady, locationId])

	// const isAccessible = location.attributes.some(
	// 	(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	// )

	if (!data) {
		return null
	}

	const address = formattedAddress && (
		<Stack spacing={12} ref={ref}>
			<Title order={3}>{t('address', { context: data.remote ? 'physical' : undefined })}</Title>
			<AddressDrawer
				locationId={locationId}
				external
				component={Link}
				variant={variants.Link.inlineInverted}
				className={classes.overlay}
			>
				<Text className={classes.overlayInner}>{formattedAddress}</Text>
			</AddressDrawer>
			<GoogleMap locationIds={data.id} height={Math.floor(width * 0.625)} width={width} />
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
			<Hours parentId={locationId} edit />
		</Stack>
	)

	return isTablet ? body : <Card>{body}</Card>
}

export interface VisitCardProps {
	locationId: string
	edit?: boolean
}
