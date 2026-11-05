import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: {
		organization: { findUniqueOrThrow: vi.fn().mockResolvedValue({ name: 'Test Org' }) },
		orgLocation: { findUniqueOrThrow: vi.fn().mockResolvedValue({ name: 'Test Location' }) },
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: getParentName } = await import('./query.getParentName.handler')

const orgFindMock = vi.mocked(prisma.organization.findUniqueOrThrow)
const locationFindMock = vi.mocked(prisma.orgLocation.findUniqueOrThrow)

/**
 * Regression: no visibility check at all on either branch - a hidden/unpublished/deleted org or location's
 * name was fetchable by anyone who had its slug/id.
 */
describe('getParentName - visibility', () => {
	it('filters the org branch to published/non-deleted for an anonymous caller', async () => {
		await getParentName({ ctx: { session: null }, input: { slug: 'test-org' } } as never)

		expect(orgFindMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { slug: 'test-org', published: true, deleted: false } })
		)
	})

	it('filters the location branch to published/non-deleted for an anonymous caller', async () => {
		await getParentName({ ctx: { session: null }, input: { orgLocationId: 'oloc_test' } } as never)

		expect(locationFindMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 'oloc_test', published: true, deleted: false } })
		)
	})

	it('does not filter for a staff caller with Data Portal access', async () => {
		await getParentName({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: { slug: 'test-org' },
		} as never)

		expect(orgFindMock).toHaveBeenCalledWith(expect.objectContaining({ where: { slug: 'test-org' } }))
	})
})
