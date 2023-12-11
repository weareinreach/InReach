import { createStyles, List, rem, Stack, Table, Text, Title } from '@mantine/core'
import { Interval } from 'luxon'
import { useTranslation } from 'next-i18next'

import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useLocalizedDays } from '~ui/hooks/useLocalizedDays'
import { trpc as api } from '~ui/lib/trpcClient'

const labelKeys = {
	regular: 'words.hours',
	service: 'words.service-hours',
} as const

const OPEN_24_MILLISECONDS = 86340000

const useStyles = createStyles(() => ({
	dow: {
		verticalAlign: 'baseline',
		paddingRight: rem(4),
	},
}))

export const Hours = ({ parentId, label = 'regular' }: HoursProps) => {
	const { t, i18n } = useTranslation('common')
	const variants = useCustomVariant()
	const { classes } = useStyles()
	const { data } = api.orgHours.forHoursDisplay.useQuery(parentId)
	const dayMap = useLocalizedDays(i18n.resolvedLanguage)
	if (!data) return null

	const labelKey = labelKeys[label]
	const timezone: string | null = null

	const hourTable = Object.entries(data).map(([dayIdx, data]) => {
		return (
			<tr key={dayIdx}>
				<td className={classes.dow}>{dayMap.get(parseInt(dayIdx))}</td>
				<td>
					<List listStyleType='none'>
						{data.map(({ id, interval: intervalISO, closed }) => {
							const interval = Interval.fromISO(intervalISO)

							return (
								<List.Item key={id}>
									{closed
										? t('hours.closed')
										: interval.toDuration('hours').valueOf() === OPEN_24_MILLISECONDS
											? t('hours.open24')
											: interval.toFormat('hh:mm a')}
								</List.Item>
							)
						})}
					</List>
				</td>
			</tr>
		)
	})

	return (
		<Stack spacing={12}>
			<div>
				<Title order={3}>{t(labelKey)}</Title>
				<Text variant={variants.Text.utility4darkGray}>{timezone}</Text>
			</div>
			<Table>
				<tbody>{hourTable}</tbody>
			</Table>
		</Stack>
	)
}

export interface HoursProps {
	parentId: string
	label?: keyof typeof labelKeys
}
