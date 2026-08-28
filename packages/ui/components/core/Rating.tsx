import { Group, Skeleton, Text, Tooltip } from '@mantine/core'
import { useTranslation } from 'next-i18next/pages'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './Rating.module.css'

export const Rating = ({ recordId, hideCount = false, noMargin = false, forceLoading = false }: Props) => {
	const { t } = useTranslation('common')
	const variants = useCustomVariant()
	const { data, status } = api.review.getAverage.useQuery(recordId as string, { enabled: Boolean(recordId) })

	const { average, count } = data ?? { count: 0 }
	const containerClass = noMargin ? classes.containerNoMargin : classes.container

	const parenRegex = /[()]/g

	if (status !== 'success' || Boolean(forceLoading)) {
		return <Skeleton className={containerClass} visible={true} />
	}

	if (average === null || count === 0) {
		return (
			<Group justify='center' gap={5} className={containerClass}>
				<Icon icon='carbon:star-filled' className={classes.iconDimmed} height={24} />
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
			<Group justify='center' gap={5} className={containerClass}>
				<Icon icon='carbon:star-filled' height={24} />
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
