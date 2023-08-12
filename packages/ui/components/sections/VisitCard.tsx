/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { Card, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useElementSize, useMediaQuery } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Badge } from '~ui/components/core/Badge'
import { GoogleMap } from '~ui/components/core/GoogleMap'
import { Hours } from '~ui/components/data-display/Hours'
import { useCustomVariant, useFormattedAddress, useScreenSize } from '~ui/hooks'
import { useGoogleMapMarker } from '~ui/hooks/useGoogleMapMarker'
import { useGoogleMaps } from '~ui/hooks/useGoogleMaps'
import { validateIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

export const VisitCard = ({ locationId, ...props }: VisitCardProps) => {
	const [marker, setMarker] = useState<google.maps.Marker>()
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
		if (data && data.latitude && data.longitude && data.name && formattedAddress && !marker && mapIsReady) {
			const newMarker = mapMarker.add({
				id: data.id,
				lat: data.latitude,
				lng: data.longitude,
				name: data.name,
				address: formattedAddress,
				map: map,
			})
			setMarker(newMarker)

			return () => {
				mapMarker.remove(newMarker)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, formattedAddress, mapMarker, map, mapIsReady])

	// const isAccessible = location.attributes.some(
	// 	(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	// )

	if (!data) return null

	const address = formattedAddress && (
		<Stack spacing={12} ref={ref}>
			<Title order={3}>{t('address', { context: data.remote ? 'physical' : undefined })}</Title>
			<Text>{formattedAddress}</Text>
			<GoogleMap locationIds={data.id} height={Math.floor(width * 0.625)} width={width} />
		</Stack>
	)

	const remoteSection = data.remote && (
		<Stack spacing={12}>
			<Badge
				variant='attribute'
				tsNs='attribute'
				tsKey={data.remote.tsKey}
				icon={validateIcon(data.remote.icon)}
			/>
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

export type VisitCardProps = {
	locationId: string
	published?: boolean
}
