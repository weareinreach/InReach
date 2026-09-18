import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	getAuditedClient: vi.fn(),
	generateId: vi.fn((prefix: string) => `${prefix}_generated`),
	generateNestedFreeTextUpsert: vi.fn(),
	Prisma: {},
}))
vi.mock('@weareinreach/crowdin/api', () => ({
	buildContextUrl: vi.fn(),
	syncDatabaseStringIfChanged: vi.fn(),
}))

const { getAuditedClient } = await import('@weareinreach/db')
const { default: upsert } = await import('./mutation.upsert.handler')

const getAuditedClientMock = vi.mocked(getAuditedClient)

const makeTx = () => {
	const orgPhoneCreate = vi.fn().mockResolvedValue({ id: 'orgPhone_test' })
	const orgPhoneUpdate = vi.fn().mockResolvedValue({ id: 'orgPhone_test' })
	getAuditedClientMock.mockReturnValue({
		$transaction: (cb: (tx: unknown) => unknown) =>
			cb({ orgPhone: { create: orgPhoneCreate, update: orgPhoneUpdate } }),
	} as never)
	return { orgPhoneCreate, orgPhoneUpdate }
}

const ctx = { actorId: 'user_test000000000000000000' } as unknown as never

describe('orgPhone.upsert - create', () => {
	/**
	 * Fixed via two layers: the zod schema now requires orgId on create (the authoritative fix for any real
	 * tRPC caller), and the handler itself uses createOneRequired (invariant-backed) instead of createOne, so
	 * even a caller that bypasses the schema entirely - like this test, which calls the handler directly - gets
	 * a clear rejection instead of silently creating an orphan.
	 */
	it('rejects creating a phone with no orgId - never creates an orphan', async () => {
		const { orgPhoneCreate } = makeTx()

		await expect(
			upsert({
				ctx,
				input: {
					operation: 'create',
					number: '+15555550100',
					countryId: 'country_test',
					// orgId intentionally omitted
				},
			} as never)
		).rejects.toThrow()

		expect(orgPhoneCreate).not.toHaveBeenCalled()
	})

	it('links the phone to its organization when orgId is provided', async () => {
		const { orgPhoneCreate } = makeTx()

		await upsert({
			ctx,
			input: {
				operation: 'create',
				number: '+15555550100',
				countryId: 'country_test',
				orgId: 'organization_test',
			},
		} as never)

		const [{ data }] = orgPhoneCreate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.organization).toEqual({ create: { organizationId: 'organization_test' } })
	})

	it('does not attempt to disconnect a phone type on create when phoneTypeId is null - there is nothing to disconnect yet', async () => {
		const { orgPhoneCreate } = makeTx()

		await upsert({
			ctx,
			input: {
				operation: 'create',
				number: '+15555550100',
				countryId: 'country_test',
				orgId: 'organization_test',
				phoneTypeId: null,
			},
		} as never)

		const [{ data }] = orgPhoneCreate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.phoneType).toBeUndefined()
	})

	it('uses the client-supplied id when one is passed', async () => {
		const { orgPhoneCreate } = makeTx()

		await upsert({
			ctx,
			input: {
				operation: 'create',
				id: 'orgPhone_clientsupplied',
				number: '+15555550100',
				countryId: 'country_test',
				orgId: 'organization_test',
			},
		} as never)

		const [{ data }] = orgPhoneCreate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.id).toBe('orgPhone_clientsupplied')
	})

	/**
	 * Fixed: the create/update branch now keys only on `isCreate`, never on whether a required field happens to
	 * be present - so operation:'create' can no longer silently fall through to calling .update() on a row that
	 * was never created. A genuinely missing countryId (bypassing the schema, which requires it) now surfaces
	 * as a clear rejection from connectOneRequired's own invariant, inside the create attempt itself, rather
	 * than being reinterpreted as "do an update instead."
	 */
	it('rejects create when countryId is missing - never silently falls through to update', async () => {
		const { orgPhoneUpdate } = makeTx()

		await expect(
			upsert({
				ctx,
				input: {
					operation: 'create',
					number: '+15555550100',
					orgId: 'organization_test',
					// countryId intentionally omitted, bypassing the schema's own requirement
				},
			} as never)
		).rejects.toThrow()

		expect(orgPhoneUpdate).not.toHaveBeenCalled()
	})
})

describe('orgPhone.upsert - update', () => {
	/**
	 * Same defect as mutation.update.handler.ts, present a second time here since `upsert` has its own
	 * independent update branch: `connectOne(phoneTypeId, 'id')` (mutation.upsert.handler.ts:111) treats `null`
	 * (explicit clear) the same as `undefined` (leave alone) - both are falsy to `connectOne`'s own `!data`
	 * check.
	 */
	it('disconnects the phone type relation when phoneTypeId is explicitly set to null', async () => {
		const { orgPhoneUpdate } = makeTx()

		await upsert({
			ctx,
			input: { operation: 'update', id: 'orgPhone_test', phoneTypeId: null },
		} as never)

		const [{ data }] = orgPhoneUpdate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.phoneType).toEqual({ disconnect: true })
	})

	it('connects a new phone type when phoneTypeId is set to a real id', async () => {
		const { orgPhoneUpdate } = makeTx()

		await upsert({
			ctx,
			input: { operation: 'update', id: 'orgPhone_test', phoneTypeId: 'phoneType_fax' },
		} as never)

		const [{ data }] = orgPhoneUpdate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.phoneType).toEqual({ connect: { id: 'phoneType_fax' } })
	})

	it('leaves the phone type relation untouched when phoneTypeId is omitted', async () => {
		const { orgPhoneUpdate } = makeTx()

		await upsert({
			ctx,
			input: { operation: 'update', id: 'orgPhone_test', ext: 'x123' },
		} as never)

		const [{ data }] = orgPhoneUpdate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.phoneType).toBeUndefined()
	})

	it('does not touch the country relation when countryId is omitted', async () => {
		const { orgPhoneUpdate } = makeTx()

		await upsert({
			ctx,
			input: { operation: 'update', id: 'orgPhone_test', ext: 'x123' },
		} as never)

		const [{ data }] = orgPhoneUpdate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.country).toBeUndefined()
	})

	it('connects the country when countryId is provided', async () => {
		const { orgPhoneUpdate } = makeTx()

		await upsert({
			ctx,
			input: { operation: 'update', id: 'orgPhone_test', countryId: 'country_ca' },
		} as never)

		const [{ data }] = orgPhoneUpdate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.country).toEqual({ connect: { id: 'country_ca' } })
	})
})
