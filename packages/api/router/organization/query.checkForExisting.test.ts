import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: {
		organization: {
			findFirst: vi.fn().mockResolvedValue({ name: 'Test Org', slug: 'test-org', published: true }),
		},
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: checkForExisting } = await import('./query.checkForExisting.handler')

const findFirstMock = vi.mocked(prisma.organization.findFirst)

/**
 * Regression: no `deleted` filter at all, and no `published` filter for non-staff callers either, despite
 * returning `published` to the client - anonymous name-guessing revealed the existence, name, slug, and
 * publish-state of hidden/deleted orgs.
 */
describe('checkForExisting - visibility', () => {
	it('filters to published, non-deleted orgs for an anonymous caller (no session)', async () => {
		await checkForExisting({ ctx: { session: null }, input: 'Test' } as never)

		expect(findFirstMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ published: true, deleted: false }),
			})
		)
	})

	it('only filters deleted (not published) for a staff caller with Data Portal access', async () => {
		await checkForExisting({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: 'Test',
		} as never)

		const call = findFirstMock.mock.calls.at(-1)?.[0]
		expect(call?.where).not.toHaveProperty('published')
		expect(call?.where).toEqual(
			expect.objectContaining({
				deleted: false,
			})
		)
	})
})
