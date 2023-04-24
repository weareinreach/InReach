/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable node/no-process-env */
import { Title, Card, Stack, Group, Text } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { type ApiOutput } from '@weareinreach/api'
import { useTranslation } from 'next-i18next'
import { z } from 'zod'

import { Badge, GoogleMap } from '~ui/components/core'
import { Hours } from '~ui/components/data-display'
import { useScreenSize, useFormattedAddress, useCustomVariant } from '~ui/hooks'
import { validateIcon } from '~ui/icon'

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
	const variants = useCustomVariant()

	// const isAccessible = location.attributes.some(
	// 	(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	// )

	const remote = location.attributes.find(
		({ attribute: { tsKey } }) => tsKey === 'additional.offers-remote-services'
	)

	if (!published && !remote && !location.hours.length) return null

	const address = formattedAddress && published && (
		<Stack spacing={12} ref={ref}>
			<Title order={3}>{t('address', { context: remote ? 'physical' : undefined })}</Title>
			<Text>{formattedAddress}</Text>
			<GoogleMap marker={location} height={Math.floor(width * 0.625)} width={width} />
		</Stack>
	)

	const remoteSection = remote && (
		<Stack spacing={12}>
			<Badge
				variant='attribute'
				tsNs='attribute'
				tsKey={remote.attribute.tsKey}
				icon={validateIcon(remote.attribute.icon)}
			/>
			<Text variant={variants.Text.utility2}>{t('remote-services')}</Text>
		</Stack>
	)

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('visit')}</Title>
			{address}
			{remoteSection}
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
