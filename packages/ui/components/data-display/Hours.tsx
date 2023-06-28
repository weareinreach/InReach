import { List, Stack, Text, Title } from '@mantine/core'
import { DateTime, Interval } from 'luxon'
import { useTranslation } from 'next-i18next'

import { COGNITO_CUSTOMID_FIELDNAME } from '@weareinreach/auth'
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

	function formatClosed(dayIndex: number) {
		const day = DateTime.fromObject({ weekday: dayIndex === 0 ? 7 : dayIndex }).toLocaleString({
			weekday: 'short',
		})
		return `${day}: Closed`
	}

	function formatInterval(interval: { s: string; e: string }, dayIndex: number, displayDay: boolean) {
		const startDate = DateTime.fromISO(interval.s)
		const endDate = DateTime.fromISO(interval.e)

		//if start and end hh:mm are the same, it's open 24 hours
		const isSameTime = startDate.hour === endDate.hour && startDate.minute === endDate.minute
		if (isSameTime) {
			return `${startDate.set({ weekday: dayIndex === 0 ? 7 : dayIndex }).toFormat('EEE: ')} Open 24 Hours`
		}

		const formatPattern = displayDay ? 'EEE: h:mm a' : 'h:mm a'
		const formattedStart = DateTime.fromISO(interval.s)
			.set({ weekday: dayIndex === 0 ? 7 : dayIndex })
			.toFormat(formatPattern)
		const formattedEnd = DateTime.fromISO(interval.e).toFormat('h:mm a')

		return `${formattedStart} - ${formattedEnd}`
	}

	hourMap.forEach((value, key) => {
		const entry = [...value].map(({ dayIndex, tz, interval, closed }, daySegment) => {
			const zone = tz ?? undefined

			if (!timezone && zone) {
				timezone = DateTime.now().setZone(zone).toFormat('ZZZZZ (ZZZZ)', { locale: i18n.language })
			}

			if (daySegment === 0 && !closed) {
				const range = formatInterval(interval, dayIndex, true)
				return range
			} else if (daySegment !== 0 && !closed) {
				const range = formatInterval(interval, dayIndex, false)
				return range
			} else if (closed) {
				const range = formatClosed(dayIndex)
				return range
			}
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
