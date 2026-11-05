import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	isIdFor: (table: string, id: string) => table === 'organization' && id.startsWith('orgn_'),
	prisma: {
		orgReview: {
			aggregate: vi.fn().mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 2 } }),
		},
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: getAverage } = await import('./query.getAverage.handler')

const aggregateMock = vi.mocked(prisma.orgReview.aggregate)

/**
 * Regression: no visible/deleted filter at all - the average/count included hidden and soft-deleted reviews,
 * and the endpoint could be probed with a hidden org/location/service id to confirm reviews exist for it.
 */
describe('review.getAverage - only counts visible, non-deleted reviews', () => {
	it('includes visible: true, deleted: false alongside the entity filter', async () => {
		await getAverage({ input: 'orgn_test' } as never)

		expect(aggregateMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { organizationId: 'orgn_test', visible: true, deleted: false },
			})
		)
	})
})
