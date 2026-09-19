import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: {
		organization: { findUnique: vi.fn() },
		slugRedirect: { findUnique: vi.fn() },
	},
}))
vi.mock('~api/cache/slugToOrgId', () => ({
	readSlugCache: vi.fn().mockResolvedValue(null),
	writeSlugCache: vi.fn(),
}))
vi.mock('@weareinreach/auth', () => ({
	checkPermissions: vi.fn().mockReturnValue(false),
}))

const { prisma } = await import('@weareinreach/db')
const { readSlugCache } = await import('~api/cache/slugToOrgId')
const { default: getIdFromSlug } = await import('./query.getIdFromSlug.handler')

const findOrgMock = vi.mocked(prisma.organization.findUnique)
const findRedirectMock = vi.mocked(prisma.slugRedirect.findUnique)
const readCacheMock = vi.mocked(readSlugCache)

const ctx: { session: null } = { session: null }

beforeEach(() => {
	findOrgMock.mockReset()
	findRedirectMock.mockReset()
	readCacheMock.mockReset()
	readCacheMock.mockResolvedValue(null)
})

describe('organization.getIdFromSlug', () => {
	it('resolves directly when the org currently has this slug', async () => {
		findOrgMock.mockResolvedValueOnce({ id: 'orgn_test', published: true, deleted: false } as never)

		const result = await getIdFromSlug({ ctx, input: { slug: 'current-slug' } } as never)

		expect(result).toEqual({ id: 'orgn_test', redirectedTo: undefined })
		expect(findRedirectMock).not.toHaveBeenCalled()
	})

	/**
	 * Reported bug, confirmed live: renaming an org regenerates its slug (see mutation.updateBasic.handler.ts)
	 * and records the change in SlugRedirect. A bookmarked or cached link using the old slug used to hard-crash
	 * the whole page with a raw Prisma "record not found" the moment `organization.findUniqueOrThrow` failed.
	 * This is the fix: fall back to the redirect table instead of throwing, so callers can resolve the org and
	 * (for page loads) follow the redirect to its current URL.
	 */
	it('falls back to the recorded redirect when the slug has since changed, instead of throwing', async () => {
		findOrgMock.mockResolvedValueOnce(null)
		findRedirectMock.mockResolvedValueOnce({ orgId: 'orgn_test', to: 'new-slug' } as never)

		const result = await getIdFromSlug({ ctx, input: { slug: 'old-slug' } } as never)

		expect(result).toEqual({ id: 'orgn_test', redirectedTo: 'new-slug' })
	})

	it('rejects with NOT_FOUND when neither the org nor a redirect exists for the slug', async () => {
		findOrgMock.mockResolvedValueOnce(null)
		findRedirectMock.mockResolvedValueOnce(null)

		await expect(getIdFromSlug({ ctx, input: { slug: 'nonexistent-slug' } } as never)).rejects.toThrow()
	})

	it('never touches the database when the slug is already cached', async () => {
		readCacheMock.mockResolvedValueOnce('orgn_cached')

		const result = await getIdFromSlug({ ctx, input: { slug: 'cached-slug' } } as never)

		expect(result).toEqual({ id: 'orgn_cached', redirectedTo: undefined })
		expect(findOrgMock).not.toHaveBeenCalled()
	})
})
