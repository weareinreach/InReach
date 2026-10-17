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

describe('location.getAlerts', () => {
	it('5.1: flattens an alert-category attributeSupplement into `{ ...tsKey, ...attribute }`', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				text: { tsKey: { key: 'alert.hours', ns: 'location', text: 'Reduced hours this week' } },
				attribute: { tag: 'reduced-hours', icon: 'clock' },
			},
		] as never)

		const result = await getAlerts({ input: { id: 'oloc_1' } } as never)

		expect(result).toEqual([
			{
				key: 'alert.hours',
				ns: 'location',
				text: 'Reduced hours this week',
				tag: 'reduced-hours',
				icon: 'clock',
			},
		])
	})

	it('5.2: excludes a supplement with an inactive attribute/category (enforced via the where clause sent to Prisma)', async () => {
		findManyMock.mockResolvedValueOnce([])

		await getAlerts({ input: { id: 'oloc_1' } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					locationId: 'oloc_1',
					attribute: { active: true, categories: { some: { category: { active: true, tag: 'alerts' } } } },
					active: true,
				},
			})
		)
	})

	/**
	 * Contrast case for organization.getAlerts's 5.3 (packages/api/router/organization) - this handler DOES
	 * correctly omit a supplement with a `text` relation but no `tsKey`, unlike its organization- level
	 * counterpart. Confirms the explicit `if (!text?.tsKey) return null` guard is what makes the difference,
	 * and that this is the "done correctly" reference for that asymmetry finding.
	 */
	it('5.3: omits a supplement whose text relation has no tsKey, rather than emitting a text-less entry', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				text: { tsKey: null },
				attribute: { tag: 'reduced-hours', icon: 'clock' },
			},
		] as never)

		const result = await getAlerts({ input: { id: 'oloc_1' } } as never)

		expect(result).toEqual([])
	})
})
