import { List, Stack, Text, Title } from '@mantine/core'
import { DateTime, Interval } from 'luxon'
import { useTranslation } from 'next-i18next'

import { useCustomVariant } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

const labelKeys = {
	regular: 'words.hours',
	service: 'words.service-hours',
} as const

export const Hours = ({ parentId, label = 'regular' }: HoursProps) => {
	const { t, i18n } = useTranslation('common')
	const variants = useCustomVariant()
	const hourDisplay: JSX.Element[] = []
	const { data } = api.orgHours.forHoursDisplay.useQuery(parentId)

	if (!data) return null

	const labelKey = labelKeys[label]

	const hourMap = new Map<number, Set<NonNullable<typeof data>[number]>>()
	let timezone: string | null = null

	for (const entry of data) {
		const daySet = hourMap.get(entry.dayIndex)
		if (!daySet) {
			hourMap.set(entry.dayIndex, new Set([entry]))
		} else {
			hourMap.set(entry.dayIndex, new Set([...daySet, entry]))
		}
	}
	const { weekYear, weekNumber } = DateTime.now()
	hourMap.forEach((value, key) => {
		const entry = [...value].map(({ start, end, dayIndex: weekday, tz }, idx) => {
			const zone = tz ?? undefined
			const open = DateTime.fromJSDate(start, { zone }).set({ weekday, weekNumber, weekYear })
			const close = DateTime.fromJSDate(end, { zone }).set({ weekday, weekNumber, weekYear })
			const interval = Interval.fromDateTimes(open, close)
			if (!timezone && zone) {
				timezone = open.toFormat('ZZZZZ (ZZZZ)', { locale: i18n.language })
			}

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
		hourDisplay.push(<List.Item key={key}>{entry.filter(Boolean).join(' & ')}</List.Item>)
	})
	if (!hourDisplay.length) return null
	return (
		<Stack spacing={12}>
			<div>
				<Title order={3}>{t(labelKey)}</Title>
				<Text variant={variants.Text.utility4darkGray}>{timezone}</Text>
			</div>
			<List listStyleType='none'>{hourDisplay}</List>
		</Stack>
	)
}

export interface HoursProps {
	parentId: string
	label?: keyof typeof labelKeys
}
