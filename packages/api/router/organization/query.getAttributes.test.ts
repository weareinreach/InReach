import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: {
		organization: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'orgn_test' }) },
		attributeSupplement: { findMany: vi.fn().mockResolvedValue([]) },
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: getAttributes } = await import('./query.getAttributes.handler')

const orgFindMock = vi.mocked(prisma.organization.findUniqueOrThrow)
const findManyMock = vi.mocked(prisma.attributeSupplement.findMany)

/**
 * Regression: no visibility check on the org at all - a hidden/unpublished/deleted org's attribute badges
 * were fetchable by anyone who had its id/slug.
 */
describe('getAttributes - visibility', () => {
	it('filters the slug lookup to published/non-deleted', async () => {
		await getAttributes({ input: { slug: 'test-org', category: 'leadership' } } as never)

		expect(orgFindMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { slug: 'test-org', published: true, deleted: false } })
		)
	})

	it('filters the attributeSupplement query to a published/non-deleted org', async () => {
		await getAttributes({ input: { id: 'orgn_test', category: 'leadership' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					organization: { id: 'orgn_test', published: true, deleted: false },
				}),
			})
		)
	})
})
