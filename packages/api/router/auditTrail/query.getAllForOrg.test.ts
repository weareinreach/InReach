import { beforeEach, describe, expect, it, vi } from 'vitest'

const getOrgRecordIdsMock = vi.fn()
vi.mock('./lib/getOrgRecordIds', () => ({
	getOrgRecordIds: (...args: unknown[]) => getOrgRecordIdsMock(...args),
}))

vi.mock('@weareinreach/db', () => ({
	prisma: {
		auditTrail: { findMany: vi.fn(), count: vi.fn() },
		user: { findMany: vi.fn().mockResolvedValue([{ id: 'user_1', name: 'Jane Staff' }]) },
	},
}))

const { prisma } = await import('@weareinreach/db')
const { default: getAllForOrg } = await import('./query.getAllForOrg.handler')

const findManyMock = vi.mocked(prisma.auditTrail.findMany)
const countMock = vi.mocked(prisma.auditTrail.count)

beforeEach(() => {
	getOrgRecordIdsMock.mockReset().mockResolvedValue(['orgn_1', 'oloc_1'])
	findManyMock.mockReset().mockResolvedValue([])
	countMock.mockReset().mockResolvedValue(0)
})

describe('auditTrail.getAllForOrg - record matching', () => {
	/**
	 * Regression: the previous query extracted a JSON path out of every row in the entire AuditTrail table and
	 * compared it - a full scan with no usable index, which is what timed out in production as the table grew.
	 * `recordId` is GIN-indexed, so matching against it directly is the actual fix.
	 */
	it('matches AuditTrail rows by the GIN-indexed recordId column, not a JSON path scan', async () => {
		await getAllForOrg({ input: { organizationId: 'orgn_1', page: 1, pageSize: 20 } } as never)

		expect(findManyMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { recordId: { hasSome: ['orgn_1', 'oloc_1'] } } })
		)
		expect(countMock).toHaveBeenCalledWith(
			expect.objectContaining({ where: { recordId: { hasSome: ['orgn_1', 'oloc_1'] } } })
		)
	})

	it('short-circuits without querying AuditTrail when the org has no record ids at all', async () => {
		getOrgRecordIdsMock.mockResolvedValueOnce([])

		const result = await getAllForOrg({
			input: { organizationId: 'orgn_missing', page: 1, pageSize: 20 },
		} as never)

		expect(result).toEqual({ results: [], totalCount: 0 })
		expect(findManyMock).not.toHaveBeenCalled()
	})
})

describe('auditTrail.getAllForOrg - operation formatting', () => {
	/**
	 * Regression: the trigger's `operation` column is 'INSERT'/'UPDATE'/'DELETE' - this code checked for
	 * 'CREATE', which never matches, so every created record fell through to the generic per-field diff
	 * (comparing every field against an empty `old`) instead of this simplified message.
	 */
	it('shows a simplified message for an INSERT, not a field-by-field diff', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				id: 'audit_1',
				timestamp: new Date('2026-01-01'),
				actorId: 'user_1',
				operation: 'INSERT',
				old: null,
				new: { id: 'oloc_1', name: 'New Location' },
				table: 'OrgLocation',
			},
		] as never)

		const result = await getAllForOrg({
			input: { organizationId: 'orgn_1', page: 1, pageSize: 20 },
		} as never)

		expect(result.results[0]?.summary).toEqual(['New OrgLocation record was created: "New Location"'])
		expect(result.results[0]?.details).toEqual({})
	})

	/**
	 * Regression: DELETE operations were previously excluded entirely upstream (`AND "new" IS NOT NULL` in the
	 * old raw SQL), so a deleted record's history silently vanished from the activity log.
	 */
	it('shows a simplified message for a DELETE instead of excluding it entirely', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				id: 'audit_2',
				timestamp: new Date('2026-01-01'),
				actorId: 'user_1',
				operation: 'DELETE',
				old: { id: 'oloc_1', name: 'Old Location' },
				new: null,
				table: 'OrgLocation',
			},
		] as never)

		const result = await getAllForOrg({
			input: { organizationId: 'orgn_1', page: 1, pageSize: 20 },
		} as never)

		expect(result.results[0]?.summary).toEqual(['OrgLocation record was deleted: "Old Location"'])
	})

	it('still produces a field-by-field diff for an UPDATE', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				id: 'audit_3',
				timestamp: new Date('2026-01-01'),
				actorId: 'user_1',
				operation: 'UPDATE',
				old: { city: 'Old City' },
				new: { city: 'New City' },
				table: 'OrgLocation',
			},
		] as never)

		const result = await getAllForOrg({
			input: { organizationId: 'orgn_1', page: 1, pageSize: 20 },
		} as never)

		expect(result.results[0]?.details.city).toBe('Old City → New City')
	})

	it('resolves the actor name from a separate user lookup (actorId has no formal relation)', async () => {
		findManyMock.mockResolvedValueOnce([
			{
				id: 'audit_4',
				timestamp: new Date('2026-01-01'),
				actorId: 'user_1',
				operation: 'UPDATE',
				old: {},
				new: {},
				table: 'Organization',
			},
		] as never)

		const result = await getAllForOrg({
			input: { organizationId: 'orgn_1', page: 1, pageSize: 20 },
		} as never)

		expect(result.results[0]?.user.name).toBe('Jane Staff')
	})
})
