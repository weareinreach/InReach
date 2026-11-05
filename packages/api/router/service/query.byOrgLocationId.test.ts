import { describe, expect, it, vi } from 'vitest'

const hiddenLocationReview = {
	id: 'orvw_test',
	rating: 5,
	reviewText: 'Helpful',
	user: {
		name: 'Jane Doe',
		image: 'https://example.org/jane.png',
		fieldVisibility: {
			name: true,
			image: true,
			currentCity: false,
			currentGovDist: false,
			currentCountry: false,
		},
		permissions: [],
	},
	language: null,
	langConfidence: null,
	translatedText: [],
	lcrCity: 'Springfield',
	lcrGovDist: { tsKey: 'gov.il', tsNs: 'gov-dist' },
	lcrCountry: { tsNs: 'country', tsKey: 'country.us' },
	createdAt: new Date('2026-01-01'),
}

vi.mock('@weareinreach/db', () => ({
	prisma: {
		orgService: {
			findMany: vi.fn().mockResolvedValue([
				{
					id: 'osvc_test',
					serviceName: null,
					services: [],
					serviceAreas: [],
					hours: [],
					reviews: [hiddenLocationReview],
					attributes: [],
					phones: [],
					emails: [],
					locations: [],
					description: null,
				},
			]),
		},
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: byOrgLocationId } = await import('./query.byOrgLocationId.handler')

const findManyMock = vi.mocked(prisma.orgService.findMany)

/**
 * Regression: no visibility check at all - any hidden/unpublished/deleted service linked to a location, or
 * services whose OTHER linked locations weren't visible, were returned in full.
 */
describe('service.byOrgLocationId - visibility', () => {
	it('filters to published/non-deleted services and locations', async () => {
		await byOrgLocationId({ input: { orgLocationId: 'oloc_test' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					published: true,
					deleted: false,
					locations: { some: { orgLocationId: 'oloc_test', location: { published: true, deleted: false } } },
				}),
			})
		)
	})
})

/**
 * Regression: reviews previously selected lcrCity/lcrGovDist/lcrCountry directly with no field-visibility
 * check at all - same reviewer-location leak already fixed for service.byId.
 */
describe('service.byOrgLocationId - redacts reviewer location per their own field-visibility preference', () => {
	it('nulls out location fields the reviewer chose to hide', async () => {
		const [result] = await byOrgLocationId({ input: { orgLocationId: 'oloc_test' } } as never)

		expect(result?.reviews[0]?.lcrCity).toBeNull()
		expect(result?.reviews[0]?.lcrGovDist).toBeNull()
		expect(result?.reviews[0]?.lcrCountry).toBeNull()
		expect(result?.reviews[0]?.user.name).toBe('Jane Doe')
	})
})
