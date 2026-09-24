import { beforeEach, describe, expect, it, vi } from 'vitest'

import { swallowListOwnershipRejection } from '~api/test/swallowListOwnershipRejection'

swallowListOwnershipRejection()

// `~api/lib/checkListOwnership` is deliberately left real (not mocked) - the whole point of these
// tests is whether the handler actually waits for and acts on what that function decides.
vi.mock('@weareinreach/db', () => ({
	prisma: { userSavedList: { findUniqueOrThrow: vi.fn(), findUnique: vi.fn() } },
	getAuditedClient: vi.fn(),
}))
vi.mock('~api/lib/nanoIdUrl', () => ({ nanoUrl: vi.fn(() => 'generated-slug') }))

const { prisma, getAuditedClient } = await import('@weareinreach/db')
const { default: shareUrl } = await import('./mutation.shareUrl.handler')

const findListMock = vi.mocked(prisma.userSavedList.findUniqueOrThrow)
const findBySlugMock = vi.mocked(prisma.userSavedList.findUnique)
const updateMock = vi.fn()
const getAuditedClientMock = vi.mocked(getAuditedClient)

beforeEach(() => {
	findListMock.mockReset()
	findBySlugMock.mockReset().mockResolvedValue(null)
	updateMock.mockReset()
	getAuditedClientMock.mockReset().mockReturnValue({ userSavedList: { update: updateMock } } as never)
})

const ctx = { session: { user: { id: 'user_owner' } }, actorId: 'user_owner' }

describe('savedLists.shareUrl', () => {
	it('generates a share link for a list the caller owns', async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'user_owner' } as never)
		updateMock.mockResolvedValueOnce({ id: 'list_1', name: 'My List', sharedLinkKey: 'generated-slug' })

		const result = await shareUrl({ ctx, input: { id: 'list_1' } } as never)

		expect(result).toEqual({ id: 'list_1', name: 'My List', sharedLinkKey: 'generated-slug' })
	})

	/**
	 * Correctly fails - confirms a real, high-severity authorization bug, not a test mistake.
	 * `mutation.shareUrl.handler.ts` calls `checkListOwnership(...)` (packages/api/lib/checkListOwnership.ts,
	 * left un-mocked above so this exercises the real function) WITHOUT `await` - the handler moves on to
	 * `prisma.userSavedList.update(...)` immediately, regardless of what that check later decides. That
	 * `update()` call's own `where` is `where: input` - and `ZShareUrlSchema` is just `{ id }`
	 * (mutation.shareUrl.schema.ts), no `ownedById` filter at all - so nothing in this handler actually
	 * enforces ownership. Any logged-in user who knows (or guesses/enumerates) another user's saved-list id can
	 * generate a public, anyone-with-the-link share URL for that list - a real privacy exposure, since saved
	 * lists are personal and this app's own userbase includes people saving LGBTQ+-specific resources. Filed as
	 * a Bug, see the issue linked in this doc's Status column once created.
	 */
	it("7.5b: a non-owner should NOT be able to generate a share link for someone else's list", async () => {
		findListMock.mockResolvedValueOnce({ id: 'list_1', ownedById: 'someone-else' } as never)
		updateMock.mockResolvedValueOnce({
			id: 'list_1',
			name: "Someone Else's List",
			sharedLinkKey: 'generated-slug',
		})

		await expect(shareUrl({ ctx, input: { id: 'list_1' } } as never)).rejects.toThrow()
	})
})
