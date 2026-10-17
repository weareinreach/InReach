import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { country: { findUniqueOrThrow: vi.fn() } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: getCountryTranslation } = await import('./query.getCountryTranslation.handler')

const findMock = vi.mocked(prisma.country.findUniqueOrThrow)

beforeEach(() => {
	findMock.mockReset()
})

describe('misc.getCountryTranslation', () => {
	it('returns the translation key data for a real cca2', async () => {
		findMock.mockResolvedValueOnce({ name: 'France', tsKey: 'country.fr', tsNs: 'countries' } as never)

		const result = await getCountryTranslation({ input: { cca2: 'FR' } } as never)

		expect(result).toEqual({ name: 'France', tsKey: 'country.fr', tsNs: 'countries' })
	})

	/**
	 * `findUniqueOrThrow` throws a Prisma `NotFoundError` for a nonexistent cca2 - `handleError` catches it,
	 * and this confirms it surfaces as a rejection (not a silently-returned `undefined`) that the
	 * already-covered §13 UI tests (search-test-inventory.md) would notice if this handler regressed to
	 * swallowing the error instead.
	 */
	it('6.6: a cca2 with no matching country rejects, rather than resolving to undefined/null', async () => {
		findMock.mockRejectedValueOnce(new Error('No Country found'))

		await expect(getCountryTranslation({ input: { cca2: 'ZZ' } } as never)).rejects.toBeTruthy()
	})
})
