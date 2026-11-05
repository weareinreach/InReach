import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ prisma: { orgReview: { findMany: vi.fn() } } }))

const { prisma } = await import('@weareinreach/db')
const { default: getByLocation } = await import('./query.getByLocation.handler')

const findManyMock = vi.mocked(prisma.orgReview.findMany)

describe('review.getByLocation - filters hidden reviews and redacts reviewer location', () => {
	it('only matches visible, non-deleted reviews for the given org/location and uses the shared select', async () => {
		findManyMock.mockResolvedValue([])

		await getByLocation({ input: { orgId: 'orgn_test', locationId: 'oloc_test' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					organizationId: 'orgn_test',
					orgLocationId: 'oloc_test',
					visible: true,
					deleted: false,
				},
				select: expect.objectContaining({ lcrCity: true }),
			})
		)
	})
})
