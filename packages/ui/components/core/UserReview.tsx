import { Group, Skeleton, Stack, Text, useMantineTheme } from '@mantine/core'
import { useDisclosure, useViewportSize } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'
import { useEffect, useRef, useState } from 'react'

import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useScreenSize } from '~ui/hooks/useScreenSize'

import { Badge } from './Badge'
import { UserAvatar } from './UserAvatar'
import classes from './UserReview.module.css'

const isTextTruncated = (event: HTMLParagraphElement | null) => {
	if (event) {
		return event.offsetHeight < event.scrollHeight || event.offsetWidth < event.scrollWidth
	}
	return false
}

export const UserReview = ({ user, reviewText, reviewDate, verifiedUser, forceLoading = false }: Props) => {
	const [showMore, showMoreHandler] = useDisclosure(true)
	const [showMoreLink, setShowMoreLink] = useState(false)
	const [initialLoad, setInitialLoad] = useState(true)
	const reviewTextRef = useRef<HTMLParagraphElement | null>(null)
	const theme = useMantineTheme()
	const variants = useCustomVariant()
	const { isMobile } = useScreenSize()
	const viewportSize = useViewportSize()
	const { t, ready } = useTranslation()

	const showMoreText = showMore ? t('show-more') : t('show-less')

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
			<Stack gap='xl' w='100%'>
				<UserAvatar loading={true} />
				<Stack className={classes.reviewText} gap={8}>
					<Skeleton variant={variants.Skeleton.text} width='100%' />
					<Skeleton variant={variants.Skeleton.text} width='100%' />
					<Skeleton variant={variants.Skeleton.text} width={100} mt={4} />
				</Stack>
				{verifiedUser ? (
					<Group gap={8}>
						<Skeleton height={20} circle />
						<Skeleton variant={variants.Skeleton.utilitySm} width={200} />
					</Group>
				) : null}
			</Stack>
		)
	}

	return (
		<Stack gap={0} align='flex-start'>
			<UserAvatar user={user} subheading={reviewDate} />
			<Stack className={classes.reviewText} gap={0}>
				<Text ref={reviewTextRef} lineClamp={lineClamp} component='p' m={0}>{`"${reviewText}"`}</Text>
				{showMoreLink ? (
					<Text
						td='underline'
						className={classes.showMore}
						fw={theme.other.fontWeight.semibold}
						onClick={showMoreHandler.toggle}
					>
						{showMoreText}
					</Text>
				) : null}
			</Stack>
			{verifiedUser && <Badge.VerifiedReviewer />}
		</Stack>
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
	image?: string | null
	name?: string | null
}
