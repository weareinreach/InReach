import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByIdsSchema } from './query.getByIds.schema'

export const getByIds = async ({ input }: TRPCHandlerParams<TGetByIdsSchema>) => {
	try {
		const results = await prisma.orgReview.findMany({
			where: {
				id: {
					in: input,
				},
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

		const filteredResults = results.map((result) => {
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
