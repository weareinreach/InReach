import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { organization: { findUniqueOrThrow: vi.fn().mockResolvedValue({ name: 'Test Org' }) } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: getNameFromSlug } = await import('./query.getNameFromSlug.handler')

const findUniqueOrThrowMock = vi.mocked(prisma.organization.findUniqueOrThrow)

/**
 * Regression: no visibility check at all - a hidden/unpublished/deleted org's name was fetchable by anyone
 * who had its slug.
 */
describe('getNameFromSlug - visibility', () => {
	it('filters to published/non-deleted for an anonymous caller (no session)', async () => {
		await getNameFromSlug({ ctx: { session: null }, input: 'test-org' } as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { slug: 'test-org', published: true, deleted: false } })
		)
	})

	it('does not filter for a staff caller with Data Portal access', async () => {
		await getNameFromSlug({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: 'test-org',
		} as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { slug: 'test-org' } })
		)
	})
})
