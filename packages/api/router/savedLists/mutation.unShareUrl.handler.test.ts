import { beforeEach, describe, expect, it, vi } from 'vitest'

import { swallowListOwnershipRejection } from '~api/test/swallowListOwnershipRejection'

swallowListOwnershipRejection()

vi.mock('@weareinreach/db', () => ({
	prisma: { userSavedList: { findUniqueOrThrow: vi.fn() } },
	getAuditedClient: vi.fn(),
}))

const { prisma, getAuditedClient } = await import('@weareinreach/db')
const { default: unShareUrl } = await import('./mutation.unShareUrl.handler')

const findListMock = vi.mocked(prisma.userSavedList.findUniqueOrThrow)
const updateMock = vi.fn()
const getAuditedClientMock = vi.mocked(getAuditedClient)

beforeEach(() => {
	findListMock.mockReset()
	updateMock.mockReset()
	getAuditedClientMock.mockReset().mockReturnValue({ userSavedList: { update: updateMock } } as never)
})

const ctx = { session: { user: { id: 'user_owner' } }, actorId: 'user_owner' }

describe('savedLists.unShareUrl', () => {
	it('revokes the share link for a list the caller owns', async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'user_owner' } as never)
		updateMock.mockResolvedValueOnce({ id: 'list_1', name: 'My List', sharedLinkKey: null })

		const result = await unShareUrl({ ctx, input: { id: 'list_1' } } as never)

		expect(result).toEqual({ id: 'list_1', name: 'My List', sharedLinkKey: null })
	})

	/**
	 * Correctly fails - same root cause and same real bug as mutation.shareUrl.handler.test.ts's 7.5b:
	 * `checkListOwnership(...)` is called without `await`, and `update()`'s `where: input` (`{ id }` only, per
	 * ZUnShareUrlSchema) has no ownership filter of its own. A non-owner can revoke another user's active share
	 * link for their list - a real availability/integrity issue on top of shareUrl's exposure one (an attacker
	 * could kill a list owner's legitimately shared link at will).
	 */
	it("7.5c: a non-owner should NOT be able to revoke someone else's share link", async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'someone-else' } as never)
		updateMock.mockResolvedValueOnce({ id: 'list_1', name: "Someone Else's List", sharedLinkKey: null })

		await expect(unShareUrl({ ctx, input: { id: 'list_1' } } as never)).rejects.toThrow()
	})
})
