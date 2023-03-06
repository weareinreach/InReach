import { Stack, Text, Group, createStyles, useMantineTheme, Skeleton, Grid } from '@mantine/core'
import { useMediaQuery, useViewportSize } from '@mantine/hooks'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from './Badge'
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
					{verifiedUser ? (
						<Group spacing={8}>
							<Skeleton height={20} circle />
							<Skeleton width={200} />
						</Group>
					) : null}
				</Stack>
			</Grid.Col>
		)
	}

	return (
		<Grid.Col sm={8}>
			<Stack spacing={0} align='flex-start'>
				<UserAvatar user={user} subheading={reviewDate} />
				<Stack className={classes.reviewText} spacing={0}>
					<Text ref={reviewTextRef} lineClamp={lineClamp} component='p'>{`"${reviewText}"`}</Text>
					{showMoreLink ? (
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
				</Stack>
				{verifiedUser && <Badge variant='verifiedReviewer' />}
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
