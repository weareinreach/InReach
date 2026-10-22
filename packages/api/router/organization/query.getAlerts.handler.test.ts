import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: { attributeSupplement: { findMany: vi.fn() } },
}))

const { prisma } = await import('@weareinreach/db')
const { default: getAlerts } = await import('./query.getAlerts.handler')

const findManyMock = vi.mocked(prisma.attributeSupplement.findMany)

beforeEach(() => {
	findManyMock.mockReset()
})

describe('organization.getAlerts', () => {
	it('5.1: flattens an alert-category attributeSupplement into `{ ...tsKey, ...attribute }`', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				text: { tsKey: { key: 'alert.closed', ns: 'org', text: 'Temporarily closed' } },
				attribute: { tag: 'temp-closed', icon: 'warning' },
			},
		] as never)

		const result = await getAlerts({ input: { id: 'orgn_1' } } as never)

		expect(result).toEqual([
			{ key: 'alert.closed', ns: 'org', text: 'Temporarily closed', tag: 'temp-closed', icon: 'warning' },
		])
	})

	it('5.4: scopes the query by whichever of id/slug was provided', async () => {
		findManyMock.mockResolvedValueOnce([])

		await getAlerts({ input: { id: 'orgn_1' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ organization: { id: 'orgn_1', slug: undefined } }),
			})
		)
	})

	/**
	 * #2076: location.getAlerts guards `if (!text?.tsKey) return null` before spreading, so a supplement with a
	 * `text` relation but no `tsKey` drops out. This handler spread `{ ...text?.tsKey, ...attribute }`
	 * unconditionally, leaving a truthy `{ tag, icon }` with no display text that `compact()` kept. It now has
	 * the same guard.
	 */
	it('5.3: a supplement with a `text` relation but no `tsKey` is omitted, matching location.getAlerts', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				text: { tsKey: null },
				attribute: { tag: 'temp-closed', icon: 'warning' },
			},
		] as never)

		const result = await getAlerts({ input: { id: 'orgn_1' } } as never)

		expect(result).toEqual([])
	})
})
