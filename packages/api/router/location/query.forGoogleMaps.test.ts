import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: {
		orgLocation: {
			findMany: vi
				.fn()
				.mockResolvedValue([{ id: 'oloc_test', name: 'Test Location', latitude: 1, longitude: 1 }]),
		},
	},
	PrismaEnums: { AddressVisibility: { FULL: 'FULL' } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: forGoogleMaps } = await import('./query.forGoogleMaps.handler')

const findManyMock = vi.mocked(prisma.orgLocation.findMany)

/**
 * Regression: same broken `canSeeAll` check as forLocationCard - `!!ctx.session?.user?.permissions` is `true`
 * for any logged-in user, not just staff.
 */
describe('forGoogleMaps - isEditMode only bypasses visibility for Data Portal staff', () => {
	it('ignores isEditMode for an anonymous caller (no session)', async () => {
		await forGoogleMaps({
			ctx: { session: null },
			input: { locationIds: ['oloc_test'], isEditMode: true },
		} as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ published: true, deleted: false }) })
		)
	})

	it('ignores isEditMode for a signed-in caller with no Data Portal permissions', async () => {
		await forGoogleMaps({
			ctx: { session: { user: { permissions: [] } } },
			input: { locationIds: ['oloc_test'], isEditMode: true },
		} as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ published: true, deleted: false }) })
		)
	})

	it('honors isEditMode for a staff caller with Data Portal access', async () => {
		await forGoogleMaps({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: { locationIds: ['oloc_test'], isEditMode: true },
		} as never)

		const call = findManyMock.mock.calls.at(-1)?.[0]
		expect(call?.where).not.toHaveProperty('published')
	})
})
