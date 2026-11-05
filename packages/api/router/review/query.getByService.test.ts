import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ prisma: { orgReview: { findMany: vi.fn() } } }))

const { prisma } = await import('@weareinreach/db')
const { default: getByService } = await import('./query.getByService.handler')

const findManyMock = vi.mocked(prisma.orgReview.findMany)

describe('review.getByService - filters hidden reviews and redacts reviewer location', () => {
	it('only matches visible, non-deleted reviews for the given org/service and uses the shared select', async () => {
		findManyMock.mockResolvedValue([])

		await getByService({ input: { orgId: 'orgn_test', serviceId: 'osvc_test' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					organizationId: 'orgn_test',
					orgServiceId: 'osvc_test',
					visible: true,
					deleted: false,
				},
				select: expect.objectContaining({ lcrCity: true }),
			})
		)
	})
})
