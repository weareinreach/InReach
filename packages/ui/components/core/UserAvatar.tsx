import { Avatar, Group, Skeleton, Stack, Text,createStyles } from '@mantine/core'
import { DateTime } from 'luxon'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { Icon } from '@iconify/react'



const useStyles = createStyles((theme) => ({
	group: {
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	loadingItems:{
		display: 'inline-block',
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

export const UserAvatar = () => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation()
	const {data: session, status } = useSession()

	const dateString = DateTime.now()
		.setLocale(i18n.resolvedLanguage)
		.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
	const subtextValue = t('in-reach-avatar-date', { dateString })

	if(status === 'loading' && !session){
		return (
			<Group className={classes.group}>
				<Skeleton height={55} circle className={classes.loadingItems} />
				<Stack align='flex-start' justify='center' spacing={4} className={classes.stack}>
					<Skeleton height={8} radius='xl' className={classes.loadingItems} w={160} h={16} />
					<Skeleton height={8} radius='xl' className={classes.loadingItems} w={160} h={16} />
				</Stack>
			</Group>
		)
	}

	return (
		<Group position='left' spacing='xs' className={classes.group}>
			<Avatar className={classes.avatar} radius='xl'>
				{session?.user.image ? (
					<Image
						src={session.user.image}
						height={48}
						width={48}
						alt={session.user.name || t('user-avatar')}
						/>
				):(
					<Icon icon='fa6-solid:user' className={classes.avatar} />
				)}
			</Avatar>
			<Stack align='flex-start' justify='center' spacing={4} className={classes.stack}>
				<Text className={classes.name}>{session?.user.name ? session?.user.name : t('in-reach-user')}</Text>
				<Text classNames={classes.subText}>{session?.user.email ? session?.user.email : subtextValue}</Text>
			</Stack>
		</Group>
	)
}