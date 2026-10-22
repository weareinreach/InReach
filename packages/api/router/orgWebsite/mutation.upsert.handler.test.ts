import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	getAuditedClient: vi.fn(),
	generateId: vi.fn((prefix: string) => `${prefix}_generated`),
	generateNestedFreeText: vi.fn(() => ({ create: { tsKey: { create: { key: 'desc-key', text: 'desc' } } } })),
	generateNestedFreeTextUpsert: vi.fn(),
	Prisma: { validator: () => (value: unknown) => value },
}))
vi.mock('@weareinreach/crowdin/api', () => ({
	buildContextUrl: vi.fn(),
	syncDatabaseStringIfChanged: vi.fn().mockResolvedValue(null),
}))

const { getAuditedClient, generateNestedFreeText } = await import('@weareinreach/db')
const { default: upsert } = await import('./mutation.upsert.handler')

const getAuditedClientMock = vi.mocked(getAuditedClient)

const makeClient = () => {
	const orgWebsiteCreate = vi.fn().mockResolvedValue({ id: 'orgWebsite_generated' })
	getAuditedClientMock.mockReturnValue({
		organization: { findUniqueOrThrow: vi.fn().mockResolvedValue({ slug: 'test-org' }) },
		orgWebsite: { findUnique: vi.fn() },
		$transaction: (cb: (tx: unknown) => unknown) => cb({ orgWebsite: { create: orgWebsiteCreate } }),
	} as never)
	return { orgWebsiteCreate }
}

const ctx = { actorId: 'user_test000000000000000000' } as unknown as never

beforeEach(() => {
	vi.clearAllMocks()
})

/**
 * #2009: a create with no client-supplied id used to fall back to `generateId('orgEmail')` - a copy-paste
 * slip that saved websites under the email prefix. Code that tells record types apart by id prefix
 * (`isIdFor`, e.g. #2102's AttributeEditWrapper fix) would then misidentify them, and the same id is reused
 * as the description's translation key. WebsiteDrawer always sends its own id today, so this only bit callers
 * that don't.
 */
describe('orgWebsite.upsert - create without an id (#2009)', () => {
	it('generates a website-prefixed id, not an email one', async () => {
		const { orgWebsiteCreate } = makeClient()

		await upsert({
			ctx,
			input: {
				operation: 'create',
				url: 'https://example.org',
				organizationId: 'orgn_test',
				isPrimary: false,
				published: true,
				deleted: false,
				orgLocationOnly: false,
			},
		} as never)

		const [{ data }] = orgWebsiteCreate.mock.calls[0] as [{ data: { id: string } }]
		expect(data.id).toBe('orgWebsite_generated')
	})

	it("uses that same website-prefixed id for the description's translation key", async () => {
		makeClient()

		await upsert({
			ctx,
			input: {
				operation: 'create',
				url: 'https://example.org',
				description: 'Main site',
				organizationId: 'orgn_test',
				isPrimary: false,
				published: true,
				deleted: false,
				orgLocationOnly: false,
			},
		} as never)

		expect(generateNestedFreeText).toHaveBeenCalledWith(
			expect.objectContaining({ itemId: 'orgWebsite_generated' })
		)
	})

	it('keeps an id the caller supplied', async () => {
		const { orgWebsiteCreate } = makeClient()

		await upsert({
			ctx,
			input: {
				operation: 'create',
				id: 'oweb_fromclient',
				url: 'https://example.org',
				organizationId: 'orgn_test',
				isPrimary: false,
				published: true,
				deleted: false,
				orgLocationOnly: false,
			},
		} as never)

		const [{ data }] = orgWebsiteCreate.mock.calls[0] as [{ data: { id: string } }]
		expect(data.id).toBe('oweb_fromclient')
	})
})
