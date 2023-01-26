import { Stack, Text, Group, createStyles, Avatar, useMantineTheme } from '@mantine/core'
import { DateTime } from 'luxon'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '../../icon'

// corresponds the the stack container width 861px
const CHARACTER_LIMIT = 107

const useStyles = createStyles((theme) => ({
	icon: {
		color: theme.other.colors.primary.allyGreen,
	},
	textContainer: {
		maxWidth: '816px',
		[theme.fn.smallerThan('md')]: {
			width: '700px',
		},
		[theme.fn.smallerThan('sm')]: {
			width: '300px',
		},
	},
	avatar: {
		height: '48px',
		width: '48px',
	},
	showMore: {
		'&:hover': {
			cursor: 'pointer',
		},
	},
}))

export const UserReview = ({ user, reviewText, verifiedUser }: Props) => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation()
	const [showMore, setShowMore] = useState(true)
	const theme = useMantineTheme()

	const showMoreText = showMore ? t('show-more') : t('show-less')
	const showShowMore = reviewText.length > CHARACTER_LIMIT

	const dateString = DateTime.now()
		.setLocale(i18n.resolvedLanguage)
		.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)

	return (
		<Stack>
			<Group>
				<Avatar radius='xl' className={classes.avatar}>
					{user?.avatarUrl ? (
						<Image src={user.avatarUrl} fill alt={user.avatarName || t('user-avatar')} />
					) : (
						<Icon icon='carbon:user' className={classes.avatar} />
					)}
				</Avatar>
				<Stack align='flex-start' justify='center' spacing={4}>
					<Text weight={theme.other.fontWeight.semibold}>
						{user.avatarName ? user.avatarName : t('in-reach-user')}
					</Text>
					<Text>{dateString}</Text>
				</Stack>
			</Group>
			<Text truncate={showMore} className={classes.textContainer}>{`"${reviewText}"`}</Text>
			{showShowMore ? (
				<Text
					td='underline'
					className={classes.showMore}
					weight={theme.other.fontWeight.semibold}
					onClick={() => {
						setShowMore(!showMore)
					}}
				>
					{showMoreText}
				</Text>
			) : null}
			{verifiedUser ? (
				<Group>
					<Icon icon='carbon:checkmark-filled' className={classes.icon}></Icon>
					<Text>{t('in-reach-verified-reviewer')}</Text>
				</Group>
			) : null}
		</Stack>
	)
}

type Props = {
	user: UserProps
	reviewText: string
	verifiedUser: boolean
}

type UserProps = {
	avatarUrl: string | null
	avatarName: string | null
}
