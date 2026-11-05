import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	Prisma: { sql: vi.fn(), join: vi.fn(), empty: Symbol('empty') },
	prisma: {
		searchSynonym: undefined,
		orgWebsite: { findMany: vi.fn().mockResolvedValue([]) },
		organization: { findMany: vi.fn().mockResolvedValue([]) },
	},
}))
vi.mock('../orgUrlDuplicateException/lib/findMatchingException', () => ({
	findMatchingException: vi.fn().mockResolvedValue(null),
}))

const { prisma } = await import('@weareinreach/db')
const { default: getPotentialMatches } = await import('./query.getPotentialMatches.handler')

const findManyMock = vi.mocked(prisma.orgWebsite.findMany)

/**
 * This endpoint is `publicProcedure` (the Suggest-an-Org form needs it with no login) but is also reused by
 * the Data Portal's internal Add an Organization modal, which legitimately needs to see unpublished/pending
 * matches. An anonymous caller must only ever match published organizations - otherwise this reveals that an
 * unpublished org exists just by trying its website.
 */
describe('getPotentialMatches - website match only exposes published orgs to non-staff callers', () => {
	it('filters to published organizations for an anonymous caller (no session)', async () => {
		await getPotentialMatches({ ctx: { session: null }, input: { website: 'https://example.org' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ organization: { published: true } }) })
		)
	})

	it('filters to published organizations for a signed-in caller with no Data Portal permissions', async () => {
		await getPotentialMatches({
			ctx: { session: { user: { permissions: [] } } },
			input: { website: 'https://example.org' },
		} as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ organization: { published: true } }) })
		)
	})

	it('does not filter by published status for a staff caller with Data Portal access', async () => {
		await getPotentialMatches({
			ctx: { session: { user: { permissions: ['dataPortalManager'] } } },
			input: { website: 'https://example.org' },
		} as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.not.objectContaining({ organization: { published: true } }) })
		)
	})
})
