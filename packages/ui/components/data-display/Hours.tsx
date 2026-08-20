import { Group, List, Skeleton, Stack, Table, Text, Title } from '@mantine/core'
import { Interval } from 'luxon'
import { type TFunction, useTranslation } from 'next-i18next/pages'

import { type ApiOutput } from '@weareinreach/api'
import { HoursDrawer } from '~ui/components/data-portal/HoursDrawer'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useLocalizedDays } from '~ui/hooks/useLocalizedDays'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './Hours.module.css'

const labelKeys = {
	regular: 'words.hours',
	service: 'words.service-hours',
} as const

const OPEN_24_MILLISECONDS = 86340000

const nullObj = {
	0: [],
	1: [],
	2: [],
	3: [],
	4: [],
	5: [],
	6: [],
}

const formatHourLine = ({ closed, interval, t }: FormatHourLineProps) => {
	if (closed) {
		return t('hours.closed')
	}
	return interval.toDuration('hours').valueOf() === OPEN_24_MILLISECONDS
		? t('hours.open24')
		: interval.toFormat('hh:mm a')
}

export const Hours = ({ parentId, label = 'regular', edit, data: passedData }: HoursProps) => {
	const { t, i18n } = useTranslation('common')
	const variants = useCustomVariant()
	const { data, isLoading } = passedData
		? { data: passedData, isLoading: false }
		: api.orgHours.forHoursDisplay.useQuery(parentId)
	const dayMap = useLocalizedDays(i18n.resolvedLanguage)
	if (!data && !isLoading && !edit) {
		return null
	}

	const labelKey = labelKeys[label]
	const timezone: string | null = null

	const hourTable = Object.entries(data ?? nullObj).map(([dayIdx, hourRecord]) => {
		return (
			<tr key={dayIdx}>
				<td className={classes.dow}>
					<Text>{dayMap.get(parseInt(dayIdx))}</Text>
				</td>
				<td className={classes.hours}>
					<List listStyleType='none'>
						{hourRecord.map(({ id, interval: intervalISO, closed }) => {
							const interval = Interval.fromISO(intervalISO)

							const textToDisplay = formatHourLine({ interval, closed, t })

							return (
								<List.Item key={id}>
									<Text>{textToDisplay}</Text>
								</List.Item>
							)
						})}
					</List>
				</td>
			</tr>
		)
	})

	const body =
		edit && !data ? (
			<Group wrap='nowrap'>
				<Icon icon='carbon:add-filled' />
				<Text>Add opening hours</Text>
			</Group>
		) : (
			<Table>
				<tbody>{hourTable}</tbody>
			</Table>
		)

	return (
		<Skeleton visible={isLoading}>
			<Stack gap={12}>
				<div>
					<Title order={3}>{t(labelKey)}</Title>
					<Text variant={variants.Text.utility4darkGray}>{timezone}</Text>
				</div>
				{edit ? (
					<HoursDrawer locationId={parentId} component='a'>
						{body}
					</HoursDrawer>
				) : (
					<Table>
						<tbody>{hourTable}</tbody>
					</Table>
				)}
			</Stack>
		</Skeleton>
	)
}

export interface HoursProps {
	parentId: string
	label?: keyof typeof labelKeys
	edit?: boolean
	data?: ApiOutput['orgHours']['forHoursDisplay']
}

interface FormatHourLineProps {
	closed: boolean
	interval: Interval
	t: TFunction
}
