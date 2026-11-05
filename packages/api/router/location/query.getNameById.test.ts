import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { orgLocation: { findUniqueOrThrow: vi.fn().mockResolvedValue({ name: 'Test Location' }) } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: getNameById } = await import('./query.getNameById.handler')

const findUniqueOrThrowMock = vi.mocked(prisma.orgLocation.findUniqueOrThrow)

/**
 * Regression: no visibility check at all - a hidden/unpublished/deleted location's name was fetchable by
 * anyone who had its id.
 */
describe('getNameById - visibility', () => {
	it('filters to published/non-deleted for an anonymous caller (no session)', async () => {
		await getNameById({ ctx: { session: null }, input: 'oloc_test' } as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 'oloc_test', published: true, deleted: false } })
		)
	})

	it('does not filter for a staff caller with Data Portal access', async () => {
		await getNameById({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: 'oloc_test',
		} as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 'oloc_test' } })
		)
	})
})
