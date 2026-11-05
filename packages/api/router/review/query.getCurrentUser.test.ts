import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ prisma: { orgReview: { findMany: vi.fn() } } }))

const { prisma } = await import('@weareinreach/db')
const { default: getCurrentUser } = await import('./query.getCurrentUser.handler')

const findManyMock = vi.mocked(prisma.orgReview.findMany)

/**
 * A review's org must always be published and not deleted; its optional location/service (a review can be
 * org-level only) must be too, if set. Previously this returned the organization's full record (including
 * fields like unpublishedReason that aren't meant for a non-staff reviewer) regardless of publish state.
 */
describe('review.getCurrentUser - only published, non-deleted org/location/service', () => {
	it("filters by the user's own reviews and requires the org (and any set location/service) to be visible", async () => {
		findManyMock.mockResolvedValue([])

		await getCurrentUser({ ctx: { session: { user: { id: 'user_test' } } } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					userId: 'user_test',
					organization: { published: true, deleted: false },
					AND: [
						{ OR: [{ orgLocationId: null }, { orgLocation: { published: true, deleted: false } }] },
						{ OR: [{ orgServiceId: null }, { orgService: { published: true, deleted: false } }] },
					],
				}),
			})
		)
	})
})
