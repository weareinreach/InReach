import { Prisma } from '@weareinreach/db'
import { z } from 'zod'

export const createReview = z.object({
	rating: z.number(),
	reviewText: z.string().optional(),
	visible: z.boolean().optional(),
	organizationId: z.string().cuid(),
	orgServiceId: z.string().cuid().optional(),
	orgLocationId: z.string().cuid().optional(),
	langCode: z.string().optional(),
	langConfidence: z.number().optional(),
	toxicity: z.number().optional(),
	lcrCity: z.string().optional(),
	lcrGovDistId: z.string().cuid().optional(),
	lcrCountryId: z.string().cuid().optional(),
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
