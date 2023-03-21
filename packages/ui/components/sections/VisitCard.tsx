import { Title, Card, List, Stack, Text, Image } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { type ApiOutput } from '@weareinreach/api'
import { Interval, DateTime } from 'luxon'
import { useTranslation } from 'next-i18next'

import { Badge } from '~ui/components/core'
import { useCustomVariant, useScreenSize, useFormattedAddress } from '~ui/hooks'

export const VisitCard = (props: VisitCardProps) => {
	const variants = useCustomVariant()
	const { isMobile } = useScreenSize()
	const { location } = props
	const { t, i18n } = useTranslation(['common', 'attribute'])
	const { ref, width } = useElementSize()
	const formattedAddress = useFormattedAddress(location)

	const hourDisplay: JSX.Element[] = []

	const hourMap = new Map<number, Set<(typeof location.hours)[number]>>()

	for (const entry of location.hours) {
		const daySet = hourMap.get(entry.dayIndex)
		if (!daySet) {
			hourMap.set(entry.dayIndex, new Set([entry]))
		} else {
			hourMap.set(entry.dayIndex, new Set([...daySet, entry]))
		}
	}
	hourMap.forEach((value, key) => {
		const entry = [...value].map(({ start, end, dayIndex: weekday }, idx) => {
			const open = DateTime.fromJSDate(start).set({ weekday })
			const close = DateTime.fromJSDate(end).set({ weekday })
			const interval = Interval.fromDateTimes(open, close)

			if (idx === 0) {
				const range = interval
					.toLocaleString(
						{ weekday: 'short', hour: 'numeric', minute: 'numeric', formatMatcher: 'best fit' },
						{ locale: i18n.language }
					)
					.split(',')
					.join('')

				return interval.isValid ? range : null
			}

			const range = interval.toLocaleString({ hour: 'numeric', minute: 'numeric' }, { locale: i18n.language })
			return interval.isValid ? range : null
		})
		if (entry[0] === null) return
		hourDisplay.push(<List.Item>{entry.filter(Boolean).join(' & ')}</List.Item>)
	})

	const isAccessible = location.attributes.some(
		(attribute) => attribute.attribute.tsKey === 'additional.wheelchair-accessible'
	)

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('visit')}</Title>
			<Stack spacing={12} ref={ref}>
				<Title order={3}>{t('address')}</Title>
				<Text>{formattedAddress}</Text>
				<Image
					src={`http://via.placeholder.com/${Math.floor(width)}x${Math.floor(width * 0.625)}`}
					alt='map placeholder'
				/>
			</Stack>
			{Boolean(location.hours.length) && (
				<Stack spacing={12}>
					<div>
						<Title order={3}>{t('hours')}</Title>
						<Text variant={variants.Text.utility4darkGray}>Timezone goes here</Text>
					</div>
					<List listStyleType='none'>{hourDisplay}</List>
				</Stack>
			)}
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
			</Stack>
		</Stack>
	)

	return isMobile ? body : <Card>{body}</Card>
}
// TODO: [IN-785] Create variant for Remote/Unpublished address
type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>
type LocationResult = NonNullable<ApiOutput['location']['getById']>

export type VisitCardProps = {
	location: PageQueryResult['locations'][number] | LocationResult
}
