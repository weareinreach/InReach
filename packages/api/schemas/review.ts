import { z } from 'zod'

import { Prisma } from '@weareinreach/db'

export const createReview = z.object({
	rating: z.number(),
	reviewText: z.string().nullable(),
	visible: z.boolean().nullable(),
	organizationId: z.string().cuid(),
	orgServiceId: z.string().cuid().nullable(),
	orgLocationId: z.string().cuid().nullable(),
	langCode: z.string().nullable(),
	langConfidence: z.number().nullable(),
	toxicity: z.number().nullable(),
	lcrCity: z.string().nullable(),
	lcrGovDistId: z.string().cuid().nullable(),
	lcrCountryId: z.string().cuid().nullable(),
})
type CreateReview = z.infer<typeof createReview>

export const transformCreateReview = (data: CreateReview): Omit<Prisma.OrgReviewCreateInput, 'user'> => {
	const { langConfidence, lcrCity, rating, reviewText, toxicity, visible } = data
	const organization = {
		connect: {
			id: data.organizationId,
		},
	}
	const orgService = data.orgServiceId ? { connect: { id: data.orgServiceId } } : undefined
	const orgLocation = data.orgLocationId ? { connect: { id: data.orgLocationId } } : undefined
	const language = data.langCode ? { connect: { localeCode: data.langCode } } : undefined
	const lcrGovDist = data.lcrGovDistId ? { connect: { id: data.lcrGovDistId } } : undefined
	const lcrCountry = data.lcrCountryId ? { connect: { id: data.lcrCountryId } } : undefined

	return {
		langConfidence,
		lcrCity,
		rating,
		reviewText,
		toxicity,
		visible: visible ?? undefined,
		organization,
		orgService,
		orgLocation,
		language,
		lcrGovDist,
		lcrCountry,
	}
}
