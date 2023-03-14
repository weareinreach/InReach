import { Text, Title, Group, Stack } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { UserReview, Rating, ActionButtons } from '~ui/components/core'
import { useCustomVariant, useScreenSize } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

const validateString = (param: unknown) => (typeof param === 'string' ? param : undefined)

export const ReviewSection = (props: ReviewSectionProps) => {
	const { t } = useTranslation(['common'])
	const variants = useCustomVariant()
	const { isMobile } = useScreenSize()
	const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
	const { slug, orgLocationId, orgServiceId } = router.query

	const queryParams = props.reviews.length ? props.reviews.map((review) => review.id) : undefined

	const { data, status } = api.review.getByIds.useQuery(queryParams ?? [], { enabled: Boolean(queryParams) })
	const { data: organizationId } = api.organization.getIdFromSlug.useQuery({ slug })

	const ratingProps = {
		recordId: organizationId?.id || validateString(orgServiceId) || validateString(orgLocationId),
	}

	const reviews =
		data && status === 'success'
			? data.map((review) => {
					const { user, reviewText, verifiedUser, createdAt, id } = review
					if (!reviewText) return null
					const props = {
						user,
						reviewText,
						reviewDate: createdAt,
						verifiedUser,
					}
					return <UserReview key={id} {...props} />
			  })
			: props.reviews.map((_, idx) => (
					<UserReview
						key={idx}
						reviewText=''
						reviewDate={new Date()}
						verifiedUser={Boolean(Math.round(Math.random()))}
						forceLoading
					/>
			  ))
	const noReviews = <Text variant={variants.Text.darkGray}>{t('no-reviews', { ns: 'common' })}</Text>

	return (
		<Stack spacing={isMobile ? 32 : 40} align='flex-start'>
			<Group position='apart' w='100%' align='center'>
				<Title order={2}>{t('review', { count: 2 })}</Title>
				<ActionButtons iconKey='review'>{t('add', { ns: 'common', item: '$t(review)' })}</ActionButtons>
			</Group>
			{Boolean(props.reviews.length) && <Rating {...ratingProps} />}
			{props.reviews.length ? reviews : noReviews}
		</Stack>
	)
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type ReviewSectionProps = {
	reviews: PageQueryResult['locations'][number]['reviews'] | PageQueryResult['reviews']
}
