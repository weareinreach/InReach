import { Icon } from '@iconify/react'
import { Avatar, Tooltip, Text, createStyles, Badge } from '@mantine/core'
import { DateTime } from 'luxon'
import { useTranslation } from 'next-i18next'
// tooltip max characters for width limit
const MAX_CHARACTERS = 80

const useStyles = createStyles((theme) => ({
	avatar: {},
	badge: {
		paddingLeft: 0,
		paddingRight: 0,
		borderStyle: 'hidden',
	},
	icon: {
		color: 'white',
		position: 'absolute',
		fontWeight: theme.other.fontWeight.semibold,
		height: '17.5px',
		width: '17.5px',
	},
	text: {
		width: 'auto',
		fontWeight: theme.other.fontWeight.semibold,
		color: 'black',
		marginLeft: '9.25px',
		textTransform: 'none',
	},
	tooltip: {},
}))

export const VerifiedBadge = ({ lastVerifiedDate }: Props) => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation()

	const dateString = DateTime.fromJSDate(lastVerifiedDate)
		.setLocale(i18n.resolvedLanguage)
		.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
	const tooltipText = t('verified-information-detail', { dateString })
	const trigger_max_width = tooltipText.length > MAX_CHARACTERS ? 600 : 'auto'

	const verified_avatar = (
		<Avatar size={24} radius='xl' className={classes.avatar} color='inReachPrimaryRegular.5' variant='filled'>
			<Icon icon='material-symbols:check' className={classes.icon} />
		</Avatar>
	)

	return (
		<Tooltip
			label={tooltipText}
			position='bottom-start'
			multiline
			offset={10}
			className={classes.tooltip}
			width={trigger_max_width}
		>
			<Badge variant='outline' radius={100} size='xl' className={classes.badge} leftSection={verified_avatar}>
				<Text className={classes.text}>{t('verified-information')}</Text>
			</Badge>
		</Tooltip>
	)
}

type Props = {
	lastVerifiedDate: Date
}
