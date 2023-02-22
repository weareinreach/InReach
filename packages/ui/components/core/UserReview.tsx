import { Stack, Text, Group, createStyles, useMantineTheme, Skeleton, Grid } from '@mantine/core'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~ui/icon'

import { UserAvatar } from './UserAvatar'

const useStyles = createStyles((theme) => ({
	showMore: {
		paddingTop: theme.spacing.sm,
		'&:hover': {
			cursor: 'pointer',
		},
	},
	reviewText: {
		paddingTop: theme.spacing.xl,
		paddingBottom: theme.spacing.xl,
	},
}))
const isTextTruncated = (event: HTMLParagraphElement | null) => {
	if (event) {
		return event.offsetHeight < event.scrollHeight || event.offsetWidth < event.scrollWidth
	}
	return false
}

export const UserReview = ({ user, reviewText, reviewDate, verifiedUser, forceLoading = false }: Props) => {
	const [showMore, setShowMore] = useState(true)
	const [showMoreLink, setShowMoreLink] = useState<boolean | undefined>()
	const [initialLoad, setInitialLoad] = useState(true)
	const reviewTextRef = useRef<HTMLParagraphElement | null>(null)
	const theme = useMantineTheme()
	const { classes } = useStyles()
	const viewportSize = useViewportSize()
	const { t, ready } = useTranslation()

	const showMoreText = showMore ? t('show-more') : t('show-less')

	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`, false)
	const clampValue = isMobile ? 3 : 2
	const lineClamp = showMore ? clampValue : undefined

	useEffect(() => {
		if (isTextTruncated(reviewTextRef.current)) {
			setShowMoreLink(true)
			setInitialLoad(false)
		} else {
			setShowMoreLink(false)
			setInitialLoad(false)
		}
	}, [showMoreLink, viewportSize])

	if (initialLoad || forceLoading || !ready) {
		return (
			<Grid.Col sm={8}>
				<Stack spacing='xl'>
					<UserAvatar loading={true} />
					<Stack className={classes.reviewText} spacing={8}>
						<Skeleton />
						<Skeleton />
						<Skeleton width={100} mt={4} />
					</Stack>
					<Group sx={!verifiedUser ? { display: 'none' } : undefined} spacing={8}>
						<Skeleton height={20} circle />
						<Skeleton width={200} />
					</Group>
				</Stack>
			</Grid.Col>
		)
	}

	return (
		<Grid.Col sm={8}>
			<Stack spacing={0}>
				<UserAvatar user={user} subheading={reviewDate} />
				<Stack className={classes.reviewText} spacing={0}>
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
				</Stack>
				{verifiedUser && (
					<Group spacing={theme.spacing.xs}>
						<Icon icon='carbon:checkmark-filled' height={20} color={theme.other.colors.primary.allyGreen} />
						<Text color={theme.other.colors.secondary.darkGray}>{t('in-reach-verified-reviewer')}</Text>
					</Group>
				)}
			</Stack>
		</Grid.Col>
	)
}

type Props = {
	user?: UserProps
	reviewText: string
	reviewDate: Date
	verifiedUser: boolean
	/** For storybook purposes */
	forceLoading?: boolean
}

type UserProps = {
	image?: string
	name?: string
}
