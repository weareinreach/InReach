import { createStyles, List, rem, Skeleton, Stack, Table, Text, Title } from '@mantine/core'
import { Interval } from 'luxon'
import { useTranslation } from 'next-i18next'

import { HoursDrawer } from '~ui/components/data-portal/HoursDrawer'
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
		borderTopStyle: 'none !important' as 'none',
		paddingTop: '0 !important',
		paddingBottom: '0 !important',
	},
	hours: {
		borderTopStyle: 'none !important' as 'none',
		paddingTop: '0 !important',
		paddingBottom: '0 !important',
	},
}))

const nullObj = {
	0: [],
	1: [],
	2: [],
	3: [],
	4: [],
	5: [],
	6: [],
}

export const Hours = ({ parentId, label = 'regular', edit }: HoursProps) => {
	const { t, i18n } = useTranslation('common')
	const variants = useCustomVariant()
	const { classes } = useStyles()
	const { data, isLoading } = api.orgHours.forHoursDisplay.useQuery(parentId)
	const dayMap = useLocalizedDays(i18n.resolvedLanguage)
	if (!data && !isLoading) return null

	const labelKey = labelKeys[label]
	const timezone: string | null = null

	const hourTable = Object.entries(data ?? nullObj).map(([dayIdx, data]) => {
		return (
			<tr key={dayIdx}>
				<td className={classes.dow}>
					<Text>{dayMap.get(parseInt(dayIdx))}</Text>
				</td>
				<td className={classes.hours}>
					<List listStyleType='none'>
						{data.map(({ id, interval: intervalISO, closed }) => {
							const interval = Interval.fromISO(intervalISO)

							return (
								<List.Item key={id}>
									<Text>
										{closed
											? t('hours.closed')
											: interval.toDuration('hours').valueOf() === OPEN_24_MILLISECONDS
												? t('hours.open24')
												: interval.toFormat('hh:mm a')}
									</Text>
								</List.Item>
							)
						})}
					</List>
				</td>
			</tr>
		)
	})

	return (
		<Skeleton visible={isLoading}>
			<Stack spacing={12}>
				<div>
					<Title order={3}>{t(labelKey)}</Title>
					<Text variant={variants.Text.utility4darkGray}>{timezone}</Text>
				</div>
				{edit ? (
					<Table>
						<HoursDrawer locationId={parentId} component='a'>
							<tbody>{hourTable}</tbody>
						</HoursDrawer>
					</Table>
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
}
