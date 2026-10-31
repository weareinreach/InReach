import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { attributeSupplement: { findMany: vi.fn().mockResolvedValue([]) } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: forBadgeEditModal } = await import('./query.forBadgeEditModal.handler')

const findManyMock = vi.mocked(prisma.attributeSupplement.findMany)

/**
 * Regression: no visibility check at all - any org id's assigned badge list was fetchable by anyone. Its one
 * real caller (BadgeEdit, a staff editing modal) legitimately needs this for an org that isn't published yet,
 * so only non-staff callers are filtered.
 */
describe('forBadgeEditModal - visibility', () => {
	it('filters to a published/non-deleted org for an anonymous caller (no session)', async () => {
		await forBadgeEditModal({
			ctx: { session: null },
			input: { id: 'orgn_test', badgeType: 'leadership' },
		} as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ organization: { published: true, deleted: false } }),
			})
		)
	})

	it('does not filter for a staff caller with Data Portal access', async () => {
		await forBadgeEditModal({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: { id: 'orgn_test', badgeType: 'leadership' },
		} as never)

		const call = findManyMock.mock.calls.at(-1)?.[0]
		expect(call?.where).not.toHaveProperty('organization')
	})
})
