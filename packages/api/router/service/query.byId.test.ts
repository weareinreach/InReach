import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ prisma: { orgService: { findUniqueOrThrow: vi.fn() } } }))

const { prisma } = await import('@weareinreach/db')
const { default: byId } = await import('./query.byId.handler')

const findUniqueOrThrowMock = vi.mocked(prisma.orgService.findUniqueOrThrow)

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

/**
 * Regression: this nested reviews block used to select lcrCity/lcrGovDist/lcrCountry directly with no
 * field-visibility check at all - a reviewer who'd chosen to hide their location still had it returned here.
 */
describe('service.byId - redacts reviewer location per their own field-visibility preference', () => {
	it('nulls out location fields the reviewer chose to hide', async () => {
		findUniqueOrThrowMock.mockResolvedValue({
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
		} as never)

		const result = await byId({ input: { id: 'osvc_test' } } as never)

		expect(result.reviews[0]?.lcrCity).toBeNull()
		expect(result.reviews[0]?.lcrGovDist).toBeNull()
		expect(result.reviews[0]?.lcrCountry).toBeNull()
		// Fields the reviewer did choose to show still come through.
		expect(result.reviews[0]?.user.name).toBe('Jane Doe')
	})
})
