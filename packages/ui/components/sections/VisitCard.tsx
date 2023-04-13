/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { Title, Card, Stack, Group, Text } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { type ApiOutput } from '@weareinreach/api'
import { useTranslation } from 'next-i18next'
import { z } from 'zod'

import { Badge, GoogleMap } from '~ui/components/core'
import { Hours } from '~ui/components/data-display'
import { useScreenSize, useFormattedAddress } from '~ui/hooks'
import { Icon } from '~ui/icon'

const Coords = z.object({
	lat: z.coerce.number(),
	lng: z.coerce.number(),
})

export const VisitCard = (props: VisitCardProps) => {
	const { isMobile } = useScreenSize()
	const { location, published = true } = props
	const { t } = useTranslation(['common', 'attribute'])
	const { ref, width } = useElementSize()
	const formattedAddress = useFormattedAddress(location)

	const isAccessible = location.attributes.some(
		(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	)
	const coords = Coords.safeParse({
		lat: location.latitude,
		lng: location.longitude,
	})

	const remote = location.attributes.find(
		({ attribute: { tsKey } }) => tsKey === 'additional.offers-remote-services'
	)

	const address = formattedAddress && (
		<Stack spacing={12} ref={ref}>
			<Title order={3}>{t('address', { context: remote ? 'physical' : undefined })}</Title>
			<Text>{formattedAddress}</Text>
			<GoogleMap marker={location} height={Math.floor(width * 0.625)} width={width} />
		</Stack>
	)

	const remoteSection = published && remote && (
		<Stack spacing={12}>
			<Group spacing={6}>
				<Icon icon={'carbon:globe'} />
				<Title order={3}>{t(`remote`)}</Title>
			</Group>
			<Text>{t(remote.attribute.tsKey)}</Text>
		</Stack>
	)

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('visit')}</Title>
			{remoteSection}
			{published ? (
				address
			) : (
				<Stack spacing={12}>
					<Text>{t('no-addresses')}</Text>
				</Stack>
			)}
			<Hours data={location.hours} />
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

	return isMobile ? body : <Card>{body}</Card>
}
// TODO: [IN-785] Create variant for Remote/Unpublished address
type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>
type LocationResult = NonNullable<ApiOutput['location']['getById']>

export type VisitCardProps = {
	location: PageQueryResult['locations'][number] | LocationResult
	published?: boolean
}
