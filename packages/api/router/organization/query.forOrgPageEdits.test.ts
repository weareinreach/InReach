import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: {
		organization: {
			findUniqueOrThrow: vi.fn().mockResolvedValue({
				id: 'orgn_test',
				name: 'Test Org',
				slug: 'test-org',
				published: true,
				deleted: false,
				lastVerified: null,
				createdAt: new Date('2026-01-01'),
				updatedAt: new Date('2026-01-01'),
				allowedEditors: [],
				description: null,
				reviews: [],
				locations: [],
				attributes: [],
			}),
		},
		// Tagged-template mock - the handler calls this twice (last-updated / first-published lookups).
		$queryRaw: vi.fn(() => Promise.resolve([])),
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: forOrgPageEdits } = await import('./query.forOrgPageEdits.handler')

const findUniqueOrThrowMock = vi.mocked(prisma.organization.findUniqueOrThrow)

/**
 * Regression: despite the name implying an edit-only context, this is `publicProcedure` with no filter of its
 * own at all - every real caller is a staff-gated edit page, but the API itself didn't check that, so a
 * hidden/unpublished/deleted org's full edit-context data (every location regardless of status) was fetchable
 * by anyone who had its slug.
 */
describe('forOrgPageEdits - only non-staff callers are restricted to published/non-deleted', () => {
	it('filters to published/non-deleted for an anonymous caller (no session)', async () => {
		await forOrgPageEdits({ ctx: { session: null }, input: { slug: 'test-org' } } as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { slug: 'test-org', published: true, deleted: false },
				select: expect.objectContaining({
					locations: expect.objectContaining({ where: { published: true, deleted: false } }),
				}),
			})
		)
	})

	it('filters to published/non-deleted for a signed-in caller with no Data Portal permissions', async () => {
		await forOrgPageEdits({
			ctx: { session: { user: { permissions: [] } } },
			input: { slug: 'test-org' },
		} as never)

		expect(findUniqueOrThrowMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { slug: 'test-org', published: true, deleted: false } })
		)
	})

	it('does not filter for a staff caller with Data Portal access', async () => {
		await forOrgPageEdits({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: { slug: 'test-org' },
		} as never)

		const call = findUniqueOrThrowMock.mock.calls.at(-1)?.[0]
		expect(call?.where).toEqual({ slug: 'test-org' })
		const locationsArg = (call?.select as { locations?: { where?: unknown } })?.locations
		expect(locationsArg?.where).toEqual({})
	})
})
