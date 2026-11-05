import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({ prisma: { orgReview: { findMany: vi.fn() } } }))

const { prisma } = await import('@weareinreach/db')
const { default: getByOrg } = await import('./query.getByOrg.handler')

const findManyMock = vi.mocked(prisma.orgReview.findMany)

/**
 * Previously a bare findMany with no select and no visible/deleted filter at all - returned every raw column
 * (including reviewer location with no field-visibility check, and hidden/unmoderated reviews). Public,
 * unused by any UI today, but still live API surface.
 */
describe('review.getByOrg - filters hidden reviews and redacts reviewer location', () => {
	it('only matches visible, non-deleted reviews and uses the shared select', async () => {
		findManyMock.mockResolvedValue([])

		await getByOrg({ input: { orgId: 'orgn_test' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { organizationId: 'orgn_test', visible: true, deleted: false },
				select: expect.objectContaining({ lcrCity: true }),
			})
		)
	})
})
