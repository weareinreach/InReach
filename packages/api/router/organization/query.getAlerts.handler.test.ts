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
	 * Correctly fails - confirms a real asymmetry vs. location.getAlerts (see query.getAlerts.handler.test.ts
	 * in packages/api/router/location, case 5.3), not a test mistake. `location.getAlerts` explicitly guards
	 * `if (!text?.tsKey) return null` before spreading, so a supplement row with a `text` relation but no
	 * `tsKey` is cleanly dropped by `compact()`. This handler has no equivalent guard - it spreads `{
	 * ...text?.tsKey, ...attribute }` unconditionally, so a missing `tsKey` just means the tsKey fields are
	 * omitted from the spread, not that the whole entry drops out. The result is a non-empty, truthy object
	 * either way, so `compact()` never removes it - this handler emits an alert entry with only `{ tag, icon }`
	 * and no display text at all, instead of omitting it the way the location-level handler does for the
	 * identical input shape.
	 */
	it('5.3: a supplement with a `text` relation but no `tsKey` should be omitted, matching location.getAlerts - it is not', async () => {
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
