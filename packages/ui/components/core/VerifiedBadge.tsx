import { Avatar, Tooltip, Text, createStyles, Badge, useMantineTheme } from '@mantine/core'
import { DateTime } from 'luxon'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'
// tooltip max characters for width limit
const MAX_CHARACTERS = 80

const useStyles = createStyles((theme) => ({
	badge: {
		paddingLeft: 0,
		paddingRight: 0,
		borderStyle: 'hidden',
	},
	icon: {
		verticalAlign: 'middle',
		margin: 0,
	},
	text: {
		...theme.other.utilityFonts.utility1,
		width: 'auto',
		marginLeft: theme.spacing.xs,
		textTransform: 'none',
	},
}))

export const VerifiedBadge = ({ lastVerifiedDate }: Props) => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation()
	const theme = useMantineTheme()

	const dateString = DateTime.fromJSDate(lastVerifiedDate)
		.setLocale(i18n.resolvedLanguage)
		.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
	const tooltipText = t('verified-information-detail', { dateString })
	const trigger_max_width = tooltipText.length > MAX_CHARACTERS ? 600 : 'auto'

	return (
		<Tooltip label={tooltipText} multiline width={trigger_max_width}>
			<Badge
				variant='outline'
				className={classes.badge}
				leftSection={
					<Icon
						icon='carbon:checkmark-filled'
						className={classes.icon}
						color={theme.other.colors.primary.allyGreen}
						height={20}
						width={20}
					/>
				}
			>
				<Text className={classes.text}>{t('verified-information')}</Text>
			</Badge>
		</Tooltip>
	)
}

type Props = {
	lastVerifiedDate: Date
}
