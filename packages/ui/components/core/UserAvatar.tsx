import { Avatar, Group, Skeleton, Stack, Text, createStyles, useMantineTheme } from '@mantine/core'
import { DateTime } from 'luxon'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	group: {
		gap: theme.spacing.md,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	loadingItems: {
		display: 'inline-block',
	},
	name: {
		width: 'auto',
		...theme.other.utilityFonts.utility1,
	},
	subText: {
		...theme.other.utilityFonts.utility2,
		color: theme.other.colors.secondary.darkGray,
	},
}))

export const UserAvatar = ({ date }: Props) => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation()
	const { data: session, status } = useSession()
	const theme = useMantineTheme()

	const dateString = DateTime.fromJSDate(date ?? new Date())
		.setLocale(i18n.resolvedLanguage)
		.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)

	if (status === 'loading' && !session) {
		return (
			<Group className={classes.group}>
				<Skeleton height={48} circle className={classes.loadingItems} />
				<Stack align='flex-start' justify='center' spacing={4}>
					<Skeleton height={16} radius='xl' className={classes.loadingItems} w={160} my={4.4} />
					<Skeleton height={16} radius='xl' className={classes.loadingItems} w={160} my={4.4} />
				</Stack>
			</Group>
		)
	}

	return (
		<Group position='left' spacing='xs' className={classes.group}>
			<Avatar src={session?.user.image} alt={session?.user.name ?? (t('user-avatar') as string)}>
				<Icon icon='carbon:user' height={24} color={theme.other.colors.secondary.darkGray} />
			</Avatar>
			<Stack align='flex-start' justify='center' spacing={4}>
				<Text className={classes.name}>{session?.user.name ?? t('in-reach-user')}</Text>
				<Text className={classes.subText}>{date ? dateString : session?.user.email}</Text>
			</Stack>
		</Group>
	)
}

interface Props {
	date?: Date
}
