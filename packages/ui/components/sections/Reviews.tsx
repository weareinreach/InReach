import { type ApiOutput } from '@weareinreach/api'

import { UserReview } from '~ui/components/core'
import { trpc as api } from '~ui/lib/trpcClient'

export const ReviewSection = (props: ReviewSectionProps) => {
	const { data, status } = api.review.getByIds.useQuery(
		props.reviews.map((review) => review.id),
		{ enabled: Boolean(props.reviews.length) }
	)

	return <></>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type ReviewSectionProps = {
	reviews: PageQueryResult['locations'][number]['reviews'] | PageQueryResult['reviews']
}
