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
		width: 'auto',
		fontWeight: theme.other.fontWeight.semibold,
		color: 'black',
		marginLeft: theme.spacing.xs,
		textTransform: 'none',
	},
	leftSection: {
		margin: 0,
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

	const verified_avatar = (
		// <Avatar size={22} radius='xl' className={classes.avatar} color='inReachPrimaryRegular.5' variant='filled'>
		<Icon
			icon='carbon:checkmark-filled'
			className={classes.icon}
			color={theme.other.colors.primary.allyGreen}
			height={20}
			width={20}
		/>
		// </Avatar>
	)

	return (
		<Tooltip label={tooltipText} position='bottom-start' multiline offset={10} width={trigger_max_width}>
			<Badge
				variant='outline'
				radius={100}
				size='xl'
				className={classes.badge}
				classNames={{ leftSection: classes.leftSection }}
				leftSection={verified_avatar}
			>
				<Text className={classes.text}>{t('verified-information')}</Text>
			</Badge>
		</Tooltip>
	)
}

type Props = {
	lastVerifiedDate: Date
}
