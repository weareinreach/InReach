import { Stack, Text, Group, createStyles, Avatar, useMantineTheme, Skeleton, Grid } from '@mantine/core'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { DateTime } from 'luxon'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	showMore: {
		'&:hover': {
			cursor: 'pointer',
		},
	},
}))
const isTextTruncated = (event: HTMLParagraphElement | null) => {
	if (event) {
		return event.offsetHeight < event.scrollHeight || event.offsetWidth < event.scrollWidth
	}
	return false
}

export const UserReview = ({ user, reviewText, verifiedUser }: Props) => {
	const [showMore, setShowMore] = useState(true)
	const [showMoreLink, setShowMoreLink] = useState<boolean | undefined>()
	const [initialLoad, setInitialLoad] = useState(true)
	const reviewTextRef = useRef<HTMLParagraphElement | null>(null)
	const theme = useMantineTheme()
	const { classes } = useStyles()
	const viewportSize = useViewportSize()
	const { t, i18n } = useTranslation()

	const showMoreText = showMore ? t('show-more') : t('show-less')

	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`, false)
	const clampValue = isMobile ? 3 : 2
	const lineClamp = showMore ? clampValue : undefined

	const dateString = DateTime.now()
		.setLocale(i18n.resolvedLanguage)
		.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)

	useEffect(() => {
		if (isTextTruncated(reviewTextRef.current)) {
			setShowMoreLink(true)
			setInitialLoad(false)
			return
		}
		setShowMoreLink(false)
		setInitialLoad(false)
	}, [showMoreLink, viewportSize])

	if (initialLoad) {
		return (
			<Grid.Col sm={8}>
				<Stack>
					<Group>
						<Skeleton height={48} circle />
						<Stack align='flex-start' justify='center' spacing={4}>
							<Skeleton height={theme.fontSizes.md} width={175} m='4px 0' />
							<Skeleton height={theme.fontSizes.md} width={125} m='4px 0' />
						</Stack>
					</Group>
					<Skeleton height={theme.fontSizes.md} p='4px 0' />
					<Skeleton height={theme.fontSizes.md} width={100} />
					<Group sx={!verifiedUser ? { display: 'none' } : undefined}>
						<Skeleton height={14} circle />
						<Skeleton height={theme.fontSizes.md} width={200} />
					</Group>
				</Stack>
			</Grid.Col>
		)
	}

	return (
		<Grid.Col sm={8}>
			<Stack spacing='xs'>
				<Group>
					<Avatar src={user?.image} alt={user?.name ?? (t('user-avatar') as string)}>
						<Icon icon='carbon:user' height={24} />
					</Avatar>
					<Stack align='flex-start' justify='center' spacing={1}>
						<Text weight={theme.other.fontWeight.semibold} span>
							{user.name ?? t('in-reach-user')}
						</Text>
						<Text color={theme.other.colors.secondary.darkGray}>{dateString}</Text>
					</Stack>
				</Group>
				<Text ref={reviewTextRef} lineClamp={lineClamp} component='p'>{`"${reviewText}"`}</Text>
				<Text
					td='underline'
					sx={!showMoreLink ? { display: 'none' } : undefined}
					className={classes.showMore}
					weight={theme.other.fontWeight.semibold}
					onClick={() => {
						setShowMore(!showMore)
					}}
				>
					{showMoreText}
				</Text>
				{verifiedUser && (
					<Group>
						<Icon icon='carbon:checkmark-filled' color={theme.other.colors.primary.allyGreen} />
						<Text>{t('in-reach-verified-reviewer')}</Text>
					</Group>
				)}
			</Stack>
		</Grid.Col>
	)
}

type Props = {
	user: UserProps
	reviewText: string
	verifiedUser: boolean
}

type UserProps = {
	image: string | null
	name: string | null
}
