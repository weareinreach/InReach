import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetFeaturedSchema } from './query.getFeatured.schema'

const getRandomItems = <T>(items: T[], count: number): T[] => {
	const randomIndexes = new Set<number>()
	if (items.length < count)
		throw new Error('Count exceeds the number of items!', { cause: { items: items.length, count } })

	while (randomIndexes.size < count) {
		randomIndexes.add(Math.floor(Math.random() * items.length))
	}

	return [...randomIndexes].map((i) => items[i]) as T[]
}

export const getFeatured = async ({ input }: TRPCHandlerParams<TGetFeaturedSchema>) => {
	try {
		const results = await prisma.orgReview.findMany({
			where: {
				featured: true,
				visible: true,
				deleted: false,
			},
			select: {
				id: true,
				rating: true,
				reviewText: true,
				user: {
					select: {
						name: true,
						image: true,
						fieldVisibility: {
							select: {
								name: true,
								image: true,
								currentCity: true,
								currentGovDist: true,
								currentCountry: true,
							},
						},
						permissions: {
							where: {
								permission: {
									name: 'isLCR',
								},
							},
						},
					},
				},
				language: {
					select: {
						languageName: true,
						nativeName: true,
					},
				},
				langConfidence: true,
				translatedText: {
					select: {
						text: true,
						language: {
							select: { localeCode: true },
						},
					},
				},
				lcrCity: true,
				lcrGovDist: {
					select: {
						tsKey: true,
						tsNs: true,
					},
				},
				lcrCountry: {
					select: {
						tsNs: true,
						tsKey: true,
					},
				},
				createdAt: true,
			},
		})

		const randomResults = getRandomItems(results, input)

		const filteredResults = randomResults.map((result) => {
			const {
				name: nameVisible,
				image: imageVisible,
				currentCity: cityVisible,
				currentGovDist: distVisible,
				currentCountry: countryVisible,
			} = result.user.fieldVisibility ?? {
				name: false,
				image: false,
				currentCity: false,
				currentGovDist: false,
				currentCountry: false,
			}

			return {
				...result,
				user: {
					image: imageVisible ? result.user.image : null,
					name: nameVisible ? result.user.name : null,
				},
				lcrCity: cityVisible ? result.lcrCity : null,
				lcrGovDist: distVisible ? result.lcrGovDist : null,
				lcrCountry: countryVisible ? result.lcrCountry : null,
				verifiedUser: Boolean(result.user.permissions.length),
			}
		})
		return filteredResults
	} catch (error) {
		handleError(error)
	}
}
