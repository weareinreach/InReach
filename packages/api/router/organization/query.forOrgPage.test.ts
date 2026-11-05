import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: {
		organization: {
			findUniqueOrThrow: vi.fn().mockResolvedValue({
				id: 'orgn_test',
				name: 'Test Org',
				slug: 'test-org',
				published: true,
				lastVerified: null,
				allowedEditors: [],
				description: null,
				reviews: [],
				locations: [],
				attributes: [],
			}),
		},
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: forOrgPage } = await import('./query.forOrgPage.handler')

const findUniqueOrThrowMock = vi.mocked(prisma.organization.findUniqueOrThrow)

/**
 * Regression: `includeArchived` was plain client input on a `publicProcedure` with no authorization check at
 * all - any anonymous caller could pass `includeArchived: true` and fetch a hidden/unpublished/deleted org's
 * full detail page, bypassing the published/deleted filter entirely. This endpoint is also wired into the
 * public Suggest-an-Org flow's "does this org already exist?" preview with `includeArchived: true` hardcoded,
 * so it's reachable with no login today, not just a theoretical risk.
 */
describe('forOrgPage - includeArchived only bypasses visibility for Data Portal staff', () => {
	it('ignores includeArchived for an anonymous caller (no session)', async () => {
		await forOrgPage({
			ctx: { session: null },
			input: { slug: 'test-org', includeArchived: true },
		} as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { slug: 'test-org', published: true, deleted: false },
			})
		)
	})

	it('ignores includeArchived for a signed-in caller with no Data Portal permissions', async () => {
		await forOrgPage({
			ctx: { session: { user: { permissions: [] } } },
			input: { slug: 'test-org', includeArchived: true },
		} as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { slug: 'test-org', published: true, deleted: false },
			})
		)
	})

	it('honors includeArchived for a staff caller with Data Portal access', async () => {
		await forOrgPage({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: { slug: 'test-org', includeArchived: true },
		} as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { slug: 'test-org' },
			})
		)
		const call = findUniqueOrThrowMock.mock.calls.at(-1)?.[0]
		expect(call?.where).not.toHaveProperty('published')
	})

	it('still applies the visibility filter for staff when includeArchived is not set', async () => {
		await forOrgPage({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: { slug: 'test-org' },
		} as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { slug: 'test-org', published: true, deleted: false },
			})
		)
	})
})
