/* eslint-disable node/no-process-env */
import { MantineProvider } from '@mantine/core'
import { QueryClient } from '@tanstack/react-query'
import { httpLink, TRPCClientError } from '@trpc/client'
import { type CreateTRPCReact } from '@trpc/react-query'
import parsePhoneNumberFrom, { isSupportedCountry } from 'libphonenumber-js'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type ReactElement, type ReactNode, StrictMode } from 'react'
import { I18nextProvider } from 'react-i18next'

import { type AppRouter } from '@weareinreach/api'
import { generateId } from '@weareinreach/db/lib/idGen'
import { transformer } from '@weareinreach/util/transformer'
import { SearchStateProvider } from '~ui/providers/SearchState'
import { storybookTheme } from '~ui/theme/storybook'

import { testI18n } from './i18nTestInstance'

/**
 * Fakes the orgPhone backend behind a REAL tRPC client (`httpLink`, non-batched) and a REAL
 * `@tanstack/react-query` `QueryClient`, intercepted at the network boundary with msw - unlike the per-hook
 * `vi.fn()` mocks used elsewhere in this package's tests, every query and mutation here shares one real
 * cache, so bugs caused by one component's write poisoning what a _different_ component instance later reads
 * (the class of bug that motivated this file) can actually surface in a test instead of being masked by each
 * test getting an isolated fake return value.
 *
 * Contracts below were verified directly against the real handlers on 2026-09-17
 * (packages/api/router/orgPhone/_.handler.ts, fieldOpt/_.handler.ts, organization/*.handler.ts) - keep this
 * in sync if those change. Deliberately out of scope: batching/streaming wire format (httpLink is
 * single-request, the real app uses httpBatchStreamLink - this only needs to prove React Query cache
 * behavior, not transport), OrgServicePhone links, and the multi-location special-case in
 * forContactInfoEdit's `getWhereId` (single-org, location-less test data throughout).
 */

const BASE_URL = 'http://localhost/trpc'

// `PhoneNumbers.tsx` branches org-vs-location behavior via `isIdFor('orgLocation', parentId)`, which
// requires a real prefix *and* a canonical ULID suffix (`Ulid.isCanonical`) - plain fixture strings
// like `'organization_test'` fail that check silently rather than throwing, which would quietly
// change which code path a test exercises. Using real `generateId` output keeps that branching
// genuine instead of accidentally always falling down the "not a location" path.
export const ORG = { id: generateId('organization'), slug: 'mock-org-slug' }
export const LOCATION = { id: generateId('orgLocation') }

export const COUNTRIES = [
	{
		id: 'country_us',
		cca2: 'US',
		name: 'United States',
		dialCode: 1,
		flag: '🇺🇸',
		tsKey: 'US',
		tsNs: 'country',
		activeForOrgs: true,
	},
	{
		id: 'country_ca',
		cca2: 'CA',
		name: 'Canada',
		dialCode: 1,
		flag: '🇨🇦',
		tsKey: 'CA',
		tsNs: 'country',
		activeForOrgs: true,
	},
] as const

export const PHONE_TYPES = [
	{ id: 'phoneType_main', tsKey: 'main', tsNs: 'phone-type' },
	{ id: 'phoneType_fax', tsKey: 'fax', tsNs: 'phone-type' },
] as const

interface OrgPhoneRow {
	id: string
	number: string
	ext: string | null
	primary: boolean
	published: boolean
	deleted: boolean
	countryId: string
	phoneTypeId: string | null
	locationOnly: boolean
	serviceOnly: boolean
	descriptionText: string | null
}

type UpsertInput = {
	operation: 'create' | 'update'
	id?: string
	orgId?: string
	number?: string
	ext?: string | null
	primary?: boolean
	published?: boolean
	deleted?: boolean
	countryId?: string
	phoneTypeId?: string | null
	locationOnly?: boolean
	serviceOnly?: boolean
	description?: string | null
}

const cca2ForCountryId = (countryId: string | undefined) => COUNTRIES.find((c) => c.id === countryId)?.cca2

const phoneTypeToKey = (phoneTypeId: string | null) => PHONE_TYPES.find((t) => t.id === phoneTypeId) ?? null

/** Seed data accepted by `createFakeOrgPhoneBackend` - a raw row, defaults filled in like the DB would. */
export type SeedPhone = Partial<OrgPhoneRow> & { number: string; countryId: string }

export const createFakeOrgPhoneBackend = () => {
	const phones = new Map<string, OrgPhoneRow>()
	// A phone belongs to at most one org (phoneId is @unique on OrganizationPhone in the real schema).
	const orgLinks = new Map<string, string>() // phoneId -> organizationId
	// Many-to-many in the real schema (OrgLocationPhone), composite-keyed.
	const locationLinks = new Set<string>() // `${locationId}:${phoneId}`

	const seedOrgPhone = (seed: SeedPhone, { orgId = ORG.id }: { orgId?: string } = {}) => {
		const row: OrgPhoneRow = {
			id: generateId('orgPhone'),
			ext: null,
			primary: false,
			published: true,
			deleted: false,
			phoneTypeId: null,
			locationOnly: false,
			serviceOnly: false,
			descriptionText: null,
			...seed,
		}
		phones.set(row.id, row)
		orgLinks.set(row.id, orgId)
		return row
	}

	const linkToLocation = (locationId: string, phoneId: string) => {
		locationLinks.add(`${locationId}:${phoneId}`)
	}

	// --- procedure implementations, matching the real handlers' contracts -------------------------

	const forEditDrawer = (input: { id: string; orgId: string }) => {
		const row = phones.get(input.id)
		if (!row) {
			return null
		}
		const cca2 = row.countryId ? cca2ForCountryId(row.countryId) : undefined
		const parsed =
			cca2 && isSupportedCountry(cca2)
				? parsePhoneNumberFrom(row.number, cca2)
				: parsePhoneNumberFrom(row.number)
		return {
			id: row.id,
			primary: row.primary,
			published: row.published,
			deleted: row.deleted,
			countryId: row.countryId,
			phoneTypeId: row.phoneTypeId,
			locationOnly: row.locationOnly,
			serviceOnly: row.serviceOnly,
			number: parsed ? parsed.format('E.164') : row.number,
			ext: row.ext,
			description: row.descriptionText,
			orgId: input.orgId,
			country: cca2,
		}
	}

	const upsert = (input: UpsertInput) => {
		if (input.operation === 'create') {
			if (!input.number || !input.countryId || !input.orgId) {
				throw new TRPCClientError('number, countryId, and orgId are required to create a phone')
			}
			const id = input.id ?? generateId('orgPhone')
			const row = seedOrgPhone(
				{
					id,
					number: input.number,
					countryId: input.countryId,
					ext: input.ext ?? null,
					primary: input.primary ?? false,
					published: input.published ?? true,
					deleted: input.deleted ?? false,
					phoneTypeId: input.phoneTypeId ?? null,
					locationOnly: input.locationOnly ?? false,
					serviceOnly: input.serviceOnly ?? false,
					descriptionText: input.description ?? null,
				},
				{ orgId: input.orgId }
			)
			return row
		}

		const existing = input.id ? phones.get(input.id) : undefined
		if (!existing) {
			throw new TRPCClientError(`orgPhone ${input.id} not found`)
		}
		const next: OrgPhoneRow = {
			...existing,
			...(input.number !== undefined ? { number: input.number } : {}),
			...(input.ext !== undefined ? { ext: input.ext } : {}),
			...(input.primary !== undefined ? { primary: input.primary } : {}),
			...(input.published !== undefined ? { published: input.published } : {}),
			...(input.deleted !== undefined ? { deleted: input.deleted } : {}),
			...(input.countryId !== undefined ? { countryId: input.countryId } : {}),
			// `null` explicitly disconnects (matches the real handler's `connectOrDisconnectId`);
			// `undefined` (key omitted) leaves the stored value untouched.
			...(input.phoneTypeId !== undefined ? { phoneTypeId: input.phoneTypeId } : {}),
			...(input.locationOnly !== undefined ? { locationOnly: input.locationOnly } : {}),
			...(input.serviceOnly !== undefined ? { serviceOnly: input.serviceOnly } : {}),
			...(input.description !== undefined ? { descriptionText: input.description } : {}),
		}
		phones.set(next.id, next)
		return next
	}

	const forContactInfoEdit = (input: { parentId: string }) => {
		const rows = [...phones.values()]
			.filter((row) => {
				if (orgLinks.get(row.id) === input.parentId) {
					return true
				}
				return locationLinks.has(`${input.parentId}:${row.id}`)
			})
			.sort((a, b) => Number(b.published) - Number(a.published) || Number(a.deleted) - Number(b.deleted))
		return rows.map((row) => {
			const phoneType = phoneTypeToKey(row.phoneTypeId)
			return {
				id: row.id,
				number: row.number,
				ext: row.ext,
				primary: row.primary,
				locationOnly: row.locationOnly,
				published: row.published,
				deleted: row.deleted,
				country: cca2ForCountryId(row.countryId),
				phoneType: phoneType ? { key: phoneType.tsKey, defaultText: phoneType.tsKey } : null,
				description: row.descriptionText ? { key: 'custom', defaultText: row.descriptionText } : null,
			}
		})
	}

	const forContactInfo = (input: { parentId: string; locationOnly?: boolean }) => {
		const rows = [...phones.values()].filter((row) => {
			if (row.deleted || !row.published) {
				return false
			}
			if (orgLinks.get(row.id) !== input.parentId && !locationLinks.has(`${input.parentId}:${row.id}`)) {
				return false
			}
			if (input.locationOnly !== undefined && row.locationOnly !== input.locationOnly) {
				return false
			}
			return true
		})
		return rows.map((row) => {
			const phoneType = phoneTypeToKey(row.phoneTypeId)
			return {
				id: row.id,
				number: row.number,
				ext: row.ext,
				primary: row.primary,
				locationOnly: row.locationOnly,
				country: cca2ForCountryId(row.countryId),
				phoneType: phoneType ? { key: phoneType.tsKey, defaultText: phoneType.tsKey } : null,
				description: row.descriptionText ? { key: 'custom', defaultText: row.descriptionText } : null,
			}
		})
	}

	// `input.slug` is part of the real procedure's input shape but isn't needed to filter this fake
	// backend's in-memory data - only `locationId` is used below.
	const getLinkOptions = (input: { slug: string; locationId: string }) => {
		return [...phones.values()]
			.filter((row) => orgLinks.get(row.id) === ORG.id)
			.filter((row) => !locationLinks.has(`${input.locationId}:${row.id}`))
			.map((row) => {
				const cca2 = cca2ForCountryId(row.countryId)
				const parsed =
					cca2 && isSupportedCountry(cca2)
						? parsePhoneNumberFrom(row.number, cca2)
						: parsePhoneNumberFrom(row.number)
				const phoneType = phoneTypeToKey(row.phoneTypeId)
				return {
					id: row.id,
					number: parsed ? parsed.formatNational() : row.number,
					description: row.descriptionText,
					phoneType: phoneType?.tsKey ?? null,
					published: row.published,
					deleted: row.deleted,
				}
			})
	}

	const locationLink = (input: { orgPhoneId: string; orgLocationId: string; action: 'link' | 'unlink' }) => {
		const key = `${input.orgLocationId}:${input.orgPhoneId}`
		if (input.action === 'link') {
			if (locationLinks.has(key)) {
				throw new TRPCClientError('already linked')
			}
			locationLinks.add(key)
		} else {
			if (!locationLinks.has(key)) {
				throw new TRPCClientError('not linked')
			}
			locationLinks.delete(key)
		}
		return { orgLocationId: input.orgLocationId, phoneId: input.orgPhoneId, active: true }
	}

	const handlers = [
		http.get(`${BASE_URL}/orgPhone.forEditDrawer`, ({ request }) =>
			respond(request, (input) => forEditDrawer(input as { id: string; orgId: string }))
		),
		http.post(`${BASE_URL}/orgPhone.upsert`, ({ request }) =>
			respond(request, (input) => upsert(input as UpsertInput))
		),
		http.get(`${BASE_URL}/orgPhone.forContactInfoEdit`, ({ request }) =>
			respond(request, (input) => forContactInfoEdit(input as { parentId: string }))
		),
		http.get(`${BASE_URL}/orgPhone.forContactInfo`, ({ request }) =>
			respond(request, (input) => forContactInfo(input as { parentId: string; locationOnly?: boolean }))
		),
		http.get(`${BASE_URL}/orgPhone.getLinkOptions`, ({ request }) =>
			respond(request, (input) => getLinkOptions(input as { slug: string; locationId: string }))
		),
		http.post(`${BASE_URL}/orgPhone.locationLink`, ({ request }) =>
			respond(request, (input) =>
				locationLink(input as { orgPhoneId: string; orgLocationId: string; action: 'link' | 'unlink' })
			)
		),
		http.get(`${BASE_URL}/fieldOpt.phoneTypes`, ({ request }) => respond(request, () => [...PHONE_TYPES])),
		http.get(`${BASE_URL}/fieldOpt.countries`, ({ request }) =>
			respond(request, (input) => {
				const filter = input as { activeForOrgs?: boolean; cca2?: string } | undefined
				return COUNTRIES.filter((c) => {
					if (filter?.activeForOrgs !== undefined && c.activeForOrgs !== filter.activeForOrgs) {
						return false
					}
					if (filter?.cca2 !== undefined && c.cca2 !== filter.cca2) {
						return false
					}
					return true
				})
			})
		),
		http.get(`${BASE_URL}/organization.getIdFromSlug`, ({ request }) =>
			respond(request, (input) => {
				const { slug } = input as { slug: string }
				if (slug !== ORG.slug) {
					throw new TRPCClientError(`no organization for slug ${slug}`)
				}
				return { id: ORG.id }
			})
		),
	]

	return { handlers, phones, orgLinks, locationLinks, seedOrgPhone, linkToLocation }
}

/** Parses a single (non-batched) tRPC `httpLink` GET request's `?input=` query param. */
const parseGetInput = (request: Request) => {
	const raw = new URL(request.url).searchParams.get('input')
	return raw ? transformer.parse(raw) : undefined
}

// Real requests to the actual dev API take realistic, *uneven* round-trip time - an in-memory fake
// that resolves near-instantly can hide races between requests that only surface when they don't
// all settle in the order they were fired. Jittered per-request delay, opt-in via NETWORK_JITTER_MS,
// approximates that without needing every test to pay for it.
const NETWORK_JITTER_MS = Number(process.env.HARNESS_NETWORK_JITTER_MS ?? 0)
// NOSONAR (typescript:S2245) - simulates network delay in a test-only fake backend, not a
// security-sensitive context that needs cryptographic randomness.
const jitter = () => (NETWORK_JITTER_MS > 0 ? Math.random() * NETWORK_JITTER_MS : 0)

const respond = async (request: Request, run: (input: unknown) => unknown) => {
	try {
		const delay = jitter()
		if (delay > 0) {
			await new Promise((resolve) => setTimeout(resolve, delay))
		}
		const input = request.method === 'GET' ? parseGetInput(request) : transformer.parse(await request.text())
		const data = await run(input)
		return HttpResponse.json({ result: { data: transformer.serialize(data) } })
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		return HttpResponse.json(
			{
				error: transformer.serialize({
					message,
					code: -32600,
					data: { code: 'BAD_REQUEST', httpStatus: 400, path: new URL(request.url).pathname },
				}),
			},
			{ status: 400 }
		)
	}
}

export const createMswServer = (handlers: ReturnType<typeof createFakeOrgPhoneBackend>['handlers']) =>
	setupServer(...handlers)

/**
 * Builds a render wrapper backed by a real `QueryClient` (same stale/gc times as production - see
 * `~ui/lib/trpcClient.ts` - so this genuinely exercises the same staleness window prod code relies on) and
 * the real `trpc.Provider` for whichever `createTRPCReact` instance the test file's
 * `vi.mock('~ui/lib/trpcClient', ...)` produced.
 */
export const buildTrpcTestWrapper = (
	trpc: CreateTRPCReact<AppRouter, unknown>,
	{ strictMode = false }: { strictMode?: boolean } = {}
) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { staleTime: 1000 * 60 * 10, gcTime: 1000 * 60 * 60 } },
	})
	const client = trpc.createClient({
		links: [httpLink({ url: BASE_URL, transformer })],
	})
	const Wrapper = ({ children }: { children: ReactNode }) => {
		const tree = (
			<trpc.Provider client={client} queryClient={queryClient}>
				<MantineProvider theme={storybookTheme} defaultColorScheme='light'>
					<I18nextProvider i18n={testI18n}>
						<SearchStateProvider initState={{ params: [] }}>{children as ReactElement}</SearchStateProvider>
					</I18nextProvider>
				</MantineProvider>
			</trpc.Provider>
		)
		// `apps/app/next.config.mjs` has `reactStrictMode: true` - in Next's dev server (not
		// production builds) that double-invokes effects on mount, which this harness doesn't
		// replicate by default. Opt in when trying to reproduce a bug seen only in `next dev`.
		return strictMode ? <StrictMode>{tree}</StrictMode> : tree
	}
	return { Wrapper, queryClient }
}
