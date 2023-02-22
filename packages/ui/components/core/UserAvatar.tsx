import { Avatar, Group, Skeleton, Stack, Text, createStyles, useMantineTheme } from '@mantine/core'
import { DateTime } from 'luxon'
import { User } from 'next-auth'
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

export const UserAvatar = ({ subheading, user, useLoggedIn = false, loading = false }: Props) => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation()
	const { data: session, status } = useSession()
	const theme = useMantineTheme()
	const subText = () => {
		switch (typeof subheading) {
			case null: {
				return null
			}
			case undefined: {
				return undefined
			}
			case 'string': {
				return subheading as string
			}
			default: {
				if (!(subheading instanceof Date)) return null
				return DateTime.fromJSDate(subheading)
					.setLocale(i18n.resolvedLanguage)
					.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
			}
		}
	}

	if (loading || (useLoggedIn && status === 'loading' && !session)) {
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

	const displayData = {
		image: user && !useLoggedIn ? user.image : session?.user.image,
		name: user && !useLoggedIn ? user.name : session?.user.name,
	}

	return (
		<Group position='left' spacing='xs'>
			<Avatar src={displayData.image} alt={displayData.name ?? (t('user-avatar') as string)}>
				<Icon icon='carbon:user' height={24} color={theme.other.colors.secondary.darkGray} />
			</Avatar>
			<Stack align='flex-start' justify='center' spacing={4}>
				<Text className={classes.name}>{displayData.name ?? t('in-reach-user')}</Text>
				{subText && (
					<Text className={classes.subText}>
						{user ? subText() : subheading === undefined ? subText() : session?.user.email}
					</Text>
				)}
			</Stack>
		</Group>
	)
}

type Props = PropsPassed | PropsSession

interface PropsPassed {
	/** Get user info from the user's logged in session */
	useLoggedIn?: false
	/** Date or text to display below the user's name */
	subheading?: Date | string
	/** User info to display */
	user?: Pick<User, 'name' | 'image'>
	/** Return loading state */
	loading?: boolean
}

interface PropsSession {
	/** Get user info from the user's logged in session */
	useLoggedIn: true
	/** Date or text to display below the user's name. If `undefined`, the user's email address will be displayed */
	subheading?: Date | string | null
	user?: undefined
	loading?: undefined
}
