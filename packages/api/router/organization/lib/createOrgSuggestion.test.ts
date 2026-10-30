import { describe, expect, it, vi } from 'vitest'

vi.mock('@weareinreach/db', () => ({
	generateId: vi.fn((prefix: string) => `${prefix}_generated`),
	generateNestedFreeText: vi.fn(),
	generateUniqueSlug: vi.fn().mockResolvedValue('test-org'),
	getAuditedClient: vi.fn(),
	prisma: { orgUrlDuplicateException: { findMany: vi.fn() } },
}))
vi.mock('@weareinreach/crowdin/api', () => ({
	addSingleKeyFromNestedFreetextCreate: vi.fn(),
	buildContextUrl: vi.fn(),
}))

const { getAuditedClient, prisma } = await import('@weareinreach/db')
const { createOrgSuggestion } = await import('./createOrgSuggestion')

const getAuditedClientMock = vi.mocked(getAuditedClient)
const findExceptionsMock = vi.mocked(prisma.orgUrlDuplicateException.findMany)

/**
 * Minimal mock covering every call createOrgSuggestion makes past the duplicate check, for the "allowed" test
 * cases that need to run all the way through to a successful create.
 *
 * `exceptions` are plain `{baseUrl, active}` rows, same shape as the real table - `findMatchingException`
 * queries them via `baseUrl: {in: [...]}`, so the mock just filters by that instead of re-implementing the
 * prefix logic under test.
 */
const mockAllowingPrisma = (
	orgWebsiteUrls: string[],
	exceptions: { baseUrl: string; active: boolean }[] = []
) => {
	const txCreateOperations = {
		organization: { create: vi.fn() },
		suggestion: { create: vi.fn() },
		orgWebsite: { create: vi.fn() },
	}
	getAuditedClientMock.mockReturnValue({
		orgWebsite: { findMany: vi.fn().mockResolvedValue(orgWebsiteUrls.map((url) => ({ url }))) },
		user: { findUnique: vi.fn().mockResolvedValue(null) },
		$transaction: vi.fn(async (callback: (tx: typeof txCreateOperations) => unknown) =>
			callback(txCreateOperations)
		),
	} as never)
	findExceptionsMock.mockImplementation((async (args: { where: { baseUrl: { in: string[] } } }) =>
		exceptions.filter((exception) => args.where.baseUrl.in.includes(exception.baseUrl))) as never)
}

const baseInput = {
	countryId: 'ctry_test',
	orgName: 'Test Org',
	orgSlug: 'test-org',
	communityFocus: undefined,
	orgAddress: undefined,
} as const

const ctx = { actorId: 'user_test000000000000000000' } as unknown as never

// Shared between the two "healthgrades.com/doctors" cases below - both submissions are checked
// against the exact same existing org and the exact same exception.
const healthgradesDoctorsExisting = ['https://healthgrades.com/doctors/personA']
const healthgradesDoctorsException = [{ baseUrl: 'healthgrades.com/doctors', active: true }]

type DuplicateCheckCase = {
	name: string
	/** Existing `OrgWebsite.url` rows already in the system. */
	existing: string[]
	exceptions: { baseUrl: string; active: boolean }[]
	/** The website on the new org submission being checked. */
	orgWebsite: string
	outcome: 'blocked' | 'allowed'
}

/**
 * `createOrgSuggestion`'s submit-time duplicate check is the hard block behind both the public "Suggest an
 * Organization" form and the Data Portal's "Add an organization" modal - these cases cover the
 * exceptions-list behavior added alongside the Org URL Duplicate Check Exceptions feature: a base URL on the
 * list only suppresses the block when the full URL genuinely differs from every existing match, never when
 * it's the literal same page submitted twice, and a narrower path-prefix exception never leaks coverage
 * outside what it was scoped to.
 */
const cases: DuplicateCheckCase[] = [
	{
		name: 'blocks a duplicate with no matching exception, same as before this feature existed',
		existing: ['https://psychologytoday.com/personA'],
		exceptions: [],
		orgWebsite: 'https://psychologytoday.com/personA',
		outcome: 'blocked',
	},
	{
		name: 'allows a duplicate domain under an active domain-wide exception when the full URL differs',
		existing: ['https://psychologytoday.com/personA'],
		exceptions: [{ baseUrl: 'psychologytoday.com', active: true }],
		orgWebsite: 'https://psychologytoday.com/personB',
		outcome: 'allowed',
	},
	{
		name: 'still blocks the literal same URL even under an active exception',
		existing: ['https://psychologytoday.com/personA'],
		exceptions: [{ baseUrl: 'psychologytoday.com', active: true }],
		orgWebsite: 'https://www.PsychologyToday.com/personA/',
		outcome: 'blocked',
	},
	{
		name: 'blocks a duplicate under a deactivated (deleted) exception',
		existing: ['https://psychologytoday.com/personA'],
		exceptions: [{ baseUrl: 'psychologytoday.com', active: false }],
		orgWebsite: 'https://psychologytoday.com/personB',
		outcome: 'blocked',
	},
	{
		name: 'allows a genuinely new website with no matching domain at all, exception or not',
		existing: [],
		exceptions: [],
		orgWebsite: 'https://example.org',
		outcome: 'allowed',
	},
	{
		name: 'allows a duplicate under a narrower active path-prefix exception when the full URL differs',
		existing: healthgradesDoctorsExisting,
		exceptions: healthgradesDoctorsException,
		orgWebsite: 'https://healthgrades.com/doctors/personB',
		outcome: 'allowed',
	},
	{
		// Same domain (so still a domain-level duplicate match), but under a different path than the
		// exception covers - the exception must not leak coverage to the rest of the domain.
		name: 'does not let a narrower path-prefix exception cover a sibling path on the same domain',
		existing: healthgradesDoctorsExisting,
		exceptions: healthgradesDoctorsException,
		orgWebsite: 'https://healthgrades.com/lawyers/personA',
		outcome: 'blocked',
	},
	{
		name: 'respects path-segment boundaries - "test.com/dr" is not covered by a "test.com/drs" exception',
		existing: ['https://test.com/drs/personA'],
		exceptions: [{ baseUrl: 'test.com/drs', active: true }],
		orgWebsite: 'https://test.com/dr',
		outcome: 'blocked',
	},
	{
		// A narrower exception ("test.com/drs") doesn't reach upward to cover the bare domain above it -
		// confirmed as the intended (not buggy) behavior after walking through it with the product owner.
		name: 'blocks a bare domain when only a narrower path-prefix exception exists for that domain',
		existing: ['https://test.com/drs'],
		exceptions: [{ baseUrl: 'test.com/drs', active: true }],
		orgWebsite: 'https://test.com',
		outcome: 'blocked',
	},
	{
		// Nothing exists yet on this domain, so there's no duplicate to suppress in the first place - the
		// exceptions list never even gets consulted.
		name: 'allows a bare domain as the very first use of that domain, even with only a narrower exception listed',
		existing: [],
		exceptions: [{ baseUrl: 'test.com/drs', active: true }],
		orgWebsite: 'https://test.com',
		outcome: 'allowed',
	},
	{
		// The domain-wide exception already covers everything the narrower one does, including paths
		// outside "/drs" - the two entries don't conflict, the broader one just makes the narrower one
		// redundant.
		name: 'lets a domain-wide exception dominate when a narrower exception for the same domain also exists',
		existing: ['https://test.com/drs/personA'],
		exceptions: [
			{ baseUrl: 'test.com', active: true },
			{ baseUrl: 'test.com/drs', active: true },
		],
		orgWebsite: 'https://test.com/lawyers/personA',
		outcome: 'allowed',
	},
]

describe('createOrgSuggestion - website duplicate check with exceptions', () => {
	it.each(cases)('$name', async ({ existing, exceptions, orgWebsite, outcome }) => {
		mockAllowingPrisma(existing, exceptions)

		const result = createOrgSuggestion({
			ctx,
			input: { ...baseInput, orgWebsite },
			sourceValue: 'suggestion',
			sourceType: 'OTHER',
		} as never)

		if (outcome === 'blocked') {
			await expect(result).rejects.toThrow('This website is already associated with an existing organization')
		} else {
			await expect(result).resolves.toEqual({ id: 'organization_generated', slug: 'test-org' })
		}
	})
})
