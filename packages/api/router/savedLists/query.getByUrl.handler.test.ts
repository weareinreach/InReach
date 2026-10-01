import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { userSavedList: { findUniqueOrThrow: vi.fn() } },
	// errorHandler.ts checks `error instanceof Prisma.PrismaClientKnownRequestError` - needs a real
	// class here (not just `{}`) or that check throws a TypeError instead of returning false.
	Prisma: { PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {} },
}))

const { prisma, Prisma } = await import('@weareinreach/db')
const { default: getByUrl } = await import('./query.getByUrl.handler')

const findListMock = vi.mocked(prisma.userSavedList.findUniqueOrThrow)

describe('savedLists.getByUrl', () => {
	it('returns the list for a valid share slug', async () => {
		findListMock.mockResolvedValueOnce({
			id: 'list_1',
			name: 'My List',
			organizations: [],
			services: [],
		} as never)

		const result = await getByUrl({ input: { slug: 'real-slug' } } as never)

		expect(result).toMatchObject({ id: 'list_1', name: 'My List' })
	})

	/**
	 * A revoked or never-valid share slug should surface as a clean NOT_FOUND, not the raw Prisma "required but
	 * not found" error `findUniqueOrThrow` throws directly.
	 */
	it('an unknown or revoked share slug surfaces as NOT_FOUND, not a raw Prisma error', async () => {
		// The mocked class above is a plain `class extends Error {}` - it doesn't actually assign `.code`
		// from the options object the way real Prisma errors do, so it's set explicitly here.
		const notFoundError = new Prisma.PrismaClientKnownRequestError(
			'An operation failed because it depends on one or more records that were required but not found.',
			{ code: 'P2025', clientVersion: 'test' }
		)
		;(notFoundError as unknown as { code: string }).code = 'P2025'
		findListMock.mockRejectedValueOnce(notFoundError)

		await expect(getByUrl({ input: { slug: 'missing-or-revoked' } } as never)).rejects.toMatchObject({
			code: 'NOT_FOUND',
		})
	})
})
