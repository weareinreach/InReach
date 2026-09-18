import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	getAuditedClient: vi.fn(),
	// errorHandler.ts checks `error instanceof Prisma.PrismaClientKnownRequestError` - needs a real
	// class here (not just `{}`) or that check throws a TypeError instead of returning false.
	Prisma: { PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {} },
}))

const { getAuditedClient } = await import('@weareinreach/db')
const { default: locationLink } = await import('./mutation.locationLink.handler')

const getAuditedClientMock = vi.mocked(getAuditedClient)

const makePrisma = () => {
	const create = vi.fn().mockResolvedValue({ orgLocationId: 'orgLocation_test', phoneId: 'orgPhone_test' })
	const del = vi.fn().mockResolvedValue({ orgLocationId: 'orgLocation_test', phoneId: 'orgPhone_test' })
	getAuditedClientMock.mockReturnValue({ orgLocationPhone: { create, delete: del } } as never)
	return { create, del }
}

const ctx = { actorId: 'user_test000000000000000000' } as unknown as never

describe('orgPhone.locationLink', () => {
	it('link creates an orgLocationPhone row for the given ids', async () => {
		const { create } = makePrisma()

		await locationLink({
			ctx,
			input: { action: 'link', orgPhoneId: 'orgPhone_test', orgLocationId: 'orgLocation_test' },
		} as never)

		expect(create).toHaveBeenCalledWith({
			data: { orgLocationId: 'orgLocation_test', phoneId: 'orgPhone_test', active: true },
		})
	})

	it('unlink deletes the orgLocationPhone row by its compound key', async () => {
		const { del } = makePrisma()

		await locationLink({
			ctx,
			input: { action: 'unlink', orgPhoneId: 'orgPhone_test', orgLocationId: 'orgLocation_test' },
		} as never)

		expect(del).toHaveBeenCalledWith({
			where: { orgLocationId_phoneId: { phoneId: 'orgPhone_test', orgLocationId: 'orgLocation_test' } },
		})
	})

	it('unlinking a phone that is already unlinked surfaces a handled TRPCError instead of crashing', async () => {
		const { del } = makePrisma()
		del.mockRejectedValueOnce(
			new Error(
				'An operation failed because it depends on one or more records that were required but not found.'
			)
		)

		await expect(
			locationLink({
				ctx,
				input: { action: 'unlink', orgPhoneId: 'orgPhone_test', orgLocationId: 'orgLocation_test' },
			} as never)
		).rejects.toMatchObject({ message: expect.stringContaining('required but not found') })
	})

	it('an invalid action is rejected rather than silently doing nothing', async () => {
		makePrisma()

		await expect(
			locationLink({
				ctx,
				input: { action: 'delete', orgPhoneId: 'orgPhone_test', orgLocationId: 'orgLocation_test' },
			} as never)
		).rejects.toMatchObject({ message: 'Invalid action' })
	})
})
