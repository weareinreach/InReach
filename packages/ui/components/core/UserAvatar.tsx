import { Avatar, Group, Stack, Text, createStyles } from '@mantine/core'
import { DateTime } from 'luxon'
import { useTranslation } from 'next-i18next'

const INREACH_USER = 'InReach User'

const useStyles = createStyles((theme) => ({
	group: {
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	avatar: {
		width: '48px',
		height: '48px',
	},
	stack: {},
	name: {
		width: 'auto',
		fontWeight: theme.other.fontWeight.semibold,
	},
	subText: {
		fontWeight: theme.other.fontWeight.regular,
	},
}))

export const UserAvatar = ({ avatarSource, userName, subtext }: Props) => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation()

	const dateString = DateTime.now()
		.setLocale(i18n.resolvedLanguage)
		.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
	const subtextValue = t('in-reach-avatar-date', { dateString })

	return (
		<Group position='left' spacing='xs' className={classes.group}>
			<Avatar src={avatarSource} className={classes.avatar} radius='xl' />
			<Stack align='flex-start' justify='center' spacing={4} className={classes.stack}>
				<Text className={classes.name}>{userName ? userName : INREACH_USER}</Text>
				<Text classNames={classes.subText}>{subtext ? subtext : subtextValue}</Text>
			</Stack>
		</Group>
	)
}

type Props = {
	avatarSource: string
	userName: string
	subtext: string
}
