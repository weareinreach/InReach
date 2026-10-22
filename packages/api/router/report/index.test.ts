import { TRPCError } from '@trpc/server'
import { describe, expect, it, vi } from 'vitest'

// Only access is under test here - the handlers themselves are stubbed.
vi.mock('./query.forReportsTable.handler', () => ({
	default: vi.fn(async () => ({ results: [], total: 0 })),
}))
vi.mock('./mutation.update.handler', () => ({ default: vi.fn(async () => ({ id: 'rprt_test' })) }))

const { t } = await import('~api/lib/initTRPC')
const { reportRouter } = await import('./index')

const callerAs = (permissions: string[]) =>
	t.createCallerFactory(reportRouter)({
		session: { user: { id: 'user_test', email: 'staff@example.org', permissions, roles: [] } },
	} as never)

const updateInput = { id: 'rprt_01H00000000000000000000000', status: 'ACKNOWLEDGED', informed: false }

/**
 * #2106: the Reports page opened for Basic staff, but both the table query and the update required Manager,
 * so Basic staff got an authorization error instead of the table. Viewing is now Basic+; changing a report
 * stays Manager+ (same split as Reviews).
 */
describe('report router access', () => {
	it('Basic staff can load the Reports table', async () => {
		await expect(callerAs(['dataPortalBasic']).forReportsTable({})).resolves.toBeDefined()
	})

	it('Basic staff still cannot update a report', async () => {
		const error = await callerAs(['dataPortalBasic'])
			.update(updateInput as never)
			.catch((e: unknown) => e)

		expect(error).toBeInstanceOf(TRPCError)
		expect(error).toMatchObject({ code: 'UNAUTHORIZED' })
	})

	it.each([['dataPortalManager'], ['dataPortalAdmin']])(
		'%s can load the table and update a report',
		async (perm) => {
			const caller = callerAs([perm])

			await expect(caller.forReportsTable({})).resolves.toBeDefined()
			await expect(caller.update(updateInput as never)).resolves.toMatchObject({ id: 'rprt_test' })
		}
	)

	it('a signed-in user with no Data Portal tier cannot load the table', async () => {
		await expect(callerAs([]).forReportsTable({})).rejects.toBeInstanceOf(TRPCError)
	})
})
