import { Group, Text, createStyles, LoadingOverlay, Tooltip, rem } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	container: {
		width: 'auto',
		position: 'relative',
		height: rem(24),
		margin: rem(8),
		padding: 'auto',
	},
	icon: {},
	text: {
		...theme.other.utilityFonts.utility1,
	},
}))

export const Rating = ({
	hideCount = false,
	organizationId,
	orgServiceId,
	orgLocationId,
	forceLoading,
}: Props) => {
	const { classes } = useStyles()
	const { t } = useTranslation('common')
	const variants = useCustomVariant()
	const { data, status } = api.review.getAverage.useQuery(
		{ organizationId, orgServiceId, orgLocationId },
		{ enabled: Boolean(organizationId || orgServiceId || orgLocationId) }
	)

	const { average, count } = data ?? { average: 0, count: 0 }

	const parenRegex = /\(|\)/g

	return (
		<Tooltip
			label={t('review-count_interval', { count, postProcess: 'interval' }).replace(parenRegex, '')}
			disabled={!hideCount}
			variant={variants.Tooltip.utility1}
		>
			<Group position='center' spacing={5} className={classes.container}>
				<LoadingOverlay visible={status !== 'success' || Boolean(forceLoading)} overlayBlur={1.75} />
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
	organizationId?: string
	orgServiceId?: string
	orgLocationId?: string
	/** For Storybook */
	forceLoading?: boolean
}
