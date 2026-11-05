import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	isIdFor: (table: string) => table === 'organization',
	prisma: {
		orgService: {
			findMany: vi.fn().mockResolvedValue([]),
		},
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: forServiceInfoCard } = await import('./query.forServiceInfoCard.handler')

const findManyMock = vi.mocked(prisma.orgService.findMany)

/**
 * Regression: `canSeeAll` was `isEditMode && ctx.session?.user` - true for ANY logged-in user at all, not
 * just staff (didn't even check for a permissions array, just that a session existed).
 */
describe('forServiceInfoCard - isEditMode only bypasses visibility for Data Portal staff', () => {
	it('ignores isEditMode for an anonymous caller (no session)', async () => {
		await forServiceInfoCard({
			ctx: { session: null },
			input: { parentId: 'orgn_test', isEditMode: true, remoteOnly: false },
		} as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ published: true, deleted: false }) })
		)
	})

	it('ignores isEditMode for a signed-in caller with no Data Portal permissions', async () => {
		await forServiceInfoCard({
			ctx: { session: { user: { permissions: [] } } },
			input: { parentId: 'orgn_test', isEditMode: true, remoteOnly: false },
		} as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ published: true, deleted: false }) })
		)
	})

	it('honors isEditMode for a staff caller with Data Portal access', async () => {
		await forServiceInfoCard({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: { parentId: 'orgn_test', isEditMode: true, remoteOnly: false },
		} as never)

		const call = findManyMock.mock.calls.at(-1)?.[0]
		expect(call?.where).not.toHaveProperty('published')
	})
})
