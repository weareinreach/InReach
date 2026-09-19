import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	generateId: vi.fn((prefix: string) => `${prefix}_generated`),
	generateNestedFreeTextUpsert: vi.fn(() => ({
		upsert: {
			create: { id: 'freeText_generated', tsKey: { create: { key: 'k', text: 't', namespace: {} } } },
			update: { tsKey: { update: { text: 't' } } },
		},
	})),
	generateUniqueSlug: vi.fn(),
	getAuditedClient: vi.fn(),
}))
vi.mock('@weareinreach/crowdin/api', () => ({
	buildContextUrl: vi.fn(() => 'https://example.com/context'),
	// Simulates the real failure mode: no CROWDIN_TOKEN configured (or Crowdin unreachable) - the
	// actual client call rejects.
	syncDatabaseStringIfChanged: vi.fn().mockRejectedValue(new Error('crowdinId must be truthy')),
}))
vi.mock('@weareinreach/util/logger', () => ({
	createLoggerInstance: () => ({ error: vi.fn() }),
}))

const { getAuditedClient } = await import('@weareinreach/db')
const { default: updateBasic } = await import('./mutation.updateBasic.handler')

const getAuditedClientMock = vi.mocked(getAuditedClient)

const makePrisma = () => {
	const findUniqueOrThrow = vi.fn().mockResolvedValue({
		name: 'Old Name',
		slug: 'old-name',
		oldSlugs: [],
		description: { tsKey: { crowdinId: null, key: 'orgn_test.description', text: 'Old description' } },
	})
	const update = vi.fn().mockResolvedValue({ name: 'Old Name', slug: 'old-name' })
	getAuditedClientMock.mockReturnValue({
		organization: { findUniqueOrThrow, update },
	} as never)
	return { findUniqueOrThrow, update }
}

const ctx = { actorId: 'user_test000000000000000000' } as unknown as never

describe('organization.updateBasic - Crowdin failures must not block the database write', () => {
	/**
	 * Reported bug, confirmed live: with Crowdin unreachable/misconfigured (e.g. no CROWDIN_TOKEN, the case in
	 * local dev), `syncDatabaseStringIfChanged` used to throw unguarded, inside the same try/catch as the
	 * actual `prisma.organization.update()` call below it - aborting the whole mutation before the database was
	 * ever touched. The description (and often the name too, since both are always submitted together by the
	 * edit page) silently never persisted, with no visible error to the user. This is the fix: a Crowdin
	 * failure is caught locally and logged, and the actual database write still goes through.
	 */
	it('still writes the description to the database when Crowdin sync throws', async () => {
		const { update } = makePrisma()

		const result = await updateBasic({
			ctx,
			input: { id: 'orgn_test', description: 'New description' },
		} as never)

		expect(update).toHaveBeenCalledTimes(1)
		const [callArgs] = update.mock.calls[0] as [{ data: { description?: unknown } }]
		expect(callArgs.data.description).toBeDefined()
		expect(result).toEqual({ name: 'Old Name', slug: 'old-name' })
	})

	it('still writes the name even when a description is also submitted and Crowdin sync throws', async () => {
		const { update } = makePrisma()

		await updateBasic({
			ctx,
			input: { id: 'orgn_test', name: 'New Name', description: 'New description' },
		} as never)

		expect(update).toHaveBeenCalledTimes(1)
		const [callArgs] = update.mock.calls[0] as [{ data: { name?: unknown } }]
		expect(callArgs.data.name).toBe('New Name')
	})
})
