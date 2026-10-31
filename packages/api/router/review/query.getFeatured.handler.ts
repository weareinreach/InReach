import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { redactReviewFieldVisibility, visibleReviewSelect } from './lib/reviewSelect'
import { type TGetFeaturedSchema } from './query.getFeatured.schema'

const getRandomItems = <T>(items: T[], count: number): T[] => {
	const randomIndexes = new Set<number>()
	if (items.length < count) {
		console.warn('Count exceeds the number of items! Setting `count` to equal `items.length`')
		count = items.length
	}

	while (randomIndexes.size < count) {
		randomIndexes.add(Math.floor(Math.random() * items.length))
	}

	return [...randomIndexes].map((i) => items[i]) as T[]
}

const getFeatured = async ({ input }: TRPCHandlerParams<TGetFeaturedSchema>) => {
	const results = await prisma.orgReview.findMany({
		where: {
			featured: true,
			visible: true,
			deleted: false,
		},
		select: visibleReviewSelect,
	})

	const randomResults = getRandomItems(results, input)

	return randomResults.map(redactReviewFieldVisibility)
}
export default getFeatured
