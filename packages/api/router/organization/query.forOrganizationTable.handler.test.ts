import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	prisma: {
		organization: { findMany: vi.fn(), count: vi.fn() },
		$queryRaw: vi.fn(),
		searchSynonym: undefined,
	},
	Prisma: {
		sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
		join: (values: unknown[]) => values,
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: forOrganizationTable } = await import('./query.forOrganizationTable.handler')

const findManyMock = vi.mocked(prisma.organization.findMany)
const countMock = vi.mocked(prisma.organization.count)
const queryRawMock = vi.mocked(prisma.$queryRaw)

const baseInput = { take: 50, skip: 0 }

beforeEach(() => {
	findManyMock.mockReset()
	countMock.mockReset()
	queryRawMock.mockReset()
	findManyMock.mockResolvedValue([])
	countMock.mockResolvedValue(0)
})

/**
 * Temporary cleanup-report filter for the location-phone display fix (see
 * orgPhone/query.forContactInfo.handler.ts) - restricts the org table to orgs with more than one published
 * location and at least one phone also linked to one of those locations. Prisma's relation filters can
 * express "has at least one" but not "has more than one" without a `_count` aggregate that isn't usable
 * inside a plain `findMany` where, so this is computed as a raw SQL query first.
 */
describe('forOrganizationTable - needsLocationPhoneCleanup', () => {
	it('does not run the cleanup-ids query at all when the filter is not requested', async () => {
		await forOrganizationTable({ input: baseInput } as never)
		expect(queryRawMock).not.toHaveBeenCalled()
	})

	it('restricts the main query to the ids returned by the cleanup-ids query when requested', async () => {
		queryRawMock.mockResolvedValueOnce([{ id: 'organization_a' }, { id: 'organization_b' }])
		await forOrganizationTable({ input: { ...baseInput, needsLocationPhoneCleanup: true } } as never)

		expect(queryRawMock).toHaveBeenCalledTimes(1)
		const [findManyArgs] = findManyMock.mock.calls[0] as [{ where: { id?: { in: string[] } } }]
		expect(findManyArgs.where.id).toEqual({ in: ['organization_a', 'organization_b'] })
		const [countArgs] = countMock.mock.calls[0] as [{ where: { id?: { in: string[] } } }]
		expect(countArgs.where.id).toEqual({ in: ['organization_a', 'organization_b'] })
	})

	/**
	 * No orgs currently need review - short-circuits before ever touching the main findMany/count, since an
	 * empty `id: { in: [] }` would correctly return nothing anyway but at the cost of two wasted queries.
	 */
	it('short-circuits to an empty result without querying the main table when no orgs match', async () => {
		queryRawMock.mockResolvedValueOnce([])
		const result = await forOrganizationTable({
			input: { ...baseInput, needsLocationPhoneCleanup: true },
		} as never)

		expect(result).toEqual({ results: [], total: 0 })
		expect(findManyMock).not.toHaveBeenCalled()
		expect(countMock).not.toHaveBeenCalled()
	})
})
