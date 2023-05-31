import { createStyles, Group, rem, Skeleton, Text, Tooltip } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme, { noMargin }: Partial<Props>) => ({
	container: {
		width: 'auto',
		position: 'relative',
		height: rem(24),
		margin: noMargin ? undefined : `${rem(8)} ${rem(0)}`,
		padding: 'auto',
	},
	icon: {},
	text: {
		...theme.other.utilityFonts.utility1,
	},
	iconDimmed: {
		color: theme.other.colors.tertiary.coolGray,
	},
	textDimmed: {
		color: theme.other.colors.secondary.darkGray,
	},
}))

export const Rating = ({ recordId, hideCount = false, noMargin = false, forceLoading = false }: Props) => {
	const { classes, cx } = useStyles({ noMargin })
	const { t } = useTranslation('common')
	const variants = useCustomVariant()
	const { data, status } = api.review.getAverage.useQuery(recordId as string, { enabled: Boolean(recordId) })

	const { average, count } = data ?? { count: 0 }

	const parenRegex = /\(|\)/g

	if (status !== 'success' || Boolean(forceLoading)) {
		return <Skeleton className={classes.container} visible={true} />
	}

	if (average === null || count === 0) {
		return (
			<Group position='center' spacing={5} className={classes.container}>
				<Icon icon='carbon:star-filled' className={cx(classes.icon, classes.iconDimmed)} height={24} />
				<Text className={cx(classes.text, classes.textDimmed)}>
					{t('review-count_interval', { count, postProcess: 'interval' })}
				</Text>
			</Group>
		)
	}

	return (
		<Tooltip
			label={t('review-count_interval', { count, postProcess: 'interval' }).replace(parenRegex, '')}
			disabled={!hideCount}
			variant={variants.Tooltip.utility1}
		>
			<Group position='center' spacing={5} className={classes.container}>
				<Icon icon='carbon:star-filled' className={classes.icon} height={24} />
				<Text className={classes.text}>
					{average === null && hideCount ? '-.-' : average}{' '}
					{!hideCount && `${t('review-count_interval', { count, postProcess: 'interval' })}`}
				</Text>
			</Group>
		</Tooltip>
	)
}

type Props = {
	hideCount?: boolean
	recordId?: string
	noMargin?: boolean
	/** For Storybook */
	forceLoading?: boolean
}
