import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', async (importOriginal) => {
	const actual = await importOriginal()
	return { ...(actual as object), getAuditedClient: vi.fn() }
})

const { getAuditedClient } = await import('@weareinreach/db')
const { default: processDrawer } = await import('./mutation.processDrawer.handler')

const getAuditedClientMock = vi.mocked(getAuditedClient)

const createdVal = {
	id: 'ohrs_01ARZ3NDEKTSV4RRFFQ69G5FAV',
	dayIndex: 1,
	closed: false,
	open24hours: false,
	tz: 'America/New_York',
	interval: '2026-01-01T09:00:00.000-05:00/2026-01-01T17:00:00.000-05:00',
}

/**
 * Regression: hours created through the drawer had no org/location/service link at all - createMany was
 * called with just the raw per-day fields, no FK. This confirms the new entityId input is actually threaded
 * into the created row.
 */
describe('orgHours.processDrawer - links newly-created hours to their location/service/org', () => {
	it('sets orgLocId on created rows when entityId is a location id', async () => {
		const createManyMock = vi.fn().mockResolvedValue({ count: 1 })
		getAuditedClientMock.mockReturnValue({ orgHours: { createMany: createManyMock } } as never)

		await processDrawer({
			ctx: { actorId: 'user_test' },
			input: {
				entityId: 'oloc_01ARZ3NDEKTSV4RRFFQ69G5FAV',
				createdVals: [createdVal],
				deletedVals: null,
				updatedVals: null,
			},
		} as never)

		expect(createManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: [expect.objectContaining({ orgLocId: 'oloc_01ARZ3NDEKTSV4RRFFQ69G5FAV' })],
			})
		)
	})

	it('sets organizationId on created rows when entityId is an organization id', async () => {
		const createManyMock = vi.fn().mockResolvedValue({ count: 1 })
		getAuditedClientMock.mockReturnValue({ orgHours: { createMany: createManyMock } } as never)

		await processDrawer({
			ctx: { actorId: 'user_test' },
			input: {
				entityId: 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV',
				createdVals: [createdVal],
				deletedVals: null,
				updatedVals: null,
			},
		} as never)

		expect(createManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: [expect.objectContaining({ organizationId: 'orgn_01ARZ3NDEKTSV4RRFFQ69G5FAV' })],
			})
		)
	})

	it('sets orgServiceId on created rows when entityId is a service id', async () => {
		const createManyMock = vi.fn().mockResolvedValue({ count: 1 })
		getAuditedClientMock.mockReturnValue({ orgHours: { createMany: createManyMock } } as never)

		await processDrawer({
			ctx: { actorId: 'user_test' },
			input: {
				entityId: 'osvc_01ARZ3NDEKTSV4RRFFQ69G5FAV',
				createdVals: [createdVal],
				deletedVals: null,
				updatedVals: null,
			},
		} as never)

		expect(createManyMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: [expect.objectContaining({ orgServiceId: 'osvc_01ARZ3NDEKTSV4RRFFQ69G5FAV' })],
			})
		)
	})
})
