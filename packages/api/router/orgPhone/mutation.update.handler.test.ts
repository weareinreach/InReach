import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	getAuditedClient: vi.fn(),
	generateNestedFreeTextUpsert: vi.fn(),
}))
vi.mock('@weareinreach/crowdin/api', () => ({
	buildContextUrl: vi.fn(),
	syncDatabaseStringIfChanged: vi.fn(),
}))

const { getAuditedClient } = await import('@weareinreach/db')
const { default: update } = await import('./mutation.update.handler')

const getAuditedClientMock = vi.mocked(getAuditedClient)

const makeTx = () => {
	const orgPhoneUpdate = vi.fn().mockResolvedValue({ id: 'orgPhone_test' })
	getAuditedClientMock.mockReturnValue({
		$transaction: (cb: (tx: unknown) => unknown) => cb({ orgPhone: { update: orgPhoneUpdate } }),
	} as never)
	return orgPhoneUpdate
}

const baseInput = { id: 'orgPhone_test', orgId: 'organization_test' }

describe('orgPhone.update - phoneTypeId handling', () => {
	/**
	 * Regression test for mutation.update.handler.ts:46 - `...(phoneTypeId && { phoneType: { connect: { id:
	 * phoneTypeId } } })` treats `null` (explicit "clear the type") identically to `undefined` (leave it
	 * alone), since both are falsy. The `phoneType` key is dropped from the Prisma `data` object entirely and
	 * the existing relation is never disconnected - this assertion documents the _intended_ behavior and
	 * currently fails against the real handler.
	 */
	it('disconnects the phone type relation when phoneTypeId is explicitly set to null', async () => {
		const orgPhoneUpdate = makeTx()

		await update({
			ctx: { actorId: 'user_test000000000000000000' },
			input: { ...baseInput, phoneTypeId: null },
		} as never)

		const [{ data }] = orgPhoneUpdate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.phoneType).toEqual({ disconnect: true })
	})

	it('connects a new phone type when phoneTypeId is set to a real id', async () => {
		const orgPhoneUpdate = makeTx()

		await update({
			ctx: { actorId: 'user_test000000000000000000' },
			input: { ...baseInput, phoneTypeId: 'phoneType_fax' },
		} as never)

		const [{ data }] = orgPhoneUpdate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.phoneType).toEqual({ connect: { id: 'phoneType_fax' } })
	})

	it('leaves the phone type relation untouched when phoneTypeId is omitted', async () => {
		const orgPhoneUpdate = makeTx()

		await update({
			ctx: { actorId: 'user_test000000000000000000' },
			input: { ...baseInput, ext: 'x123' },
		} as never)

		const [{ data }] = orgPhoneUpdate.mock.calls[0] as [{ data: Record<string, unknown> }]
		expect(data.phoneType).toBeUndefined()
	})
})
