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

interface OrgEmailRow {
	id: string
	email: string
	firstName: string | null
	lastName: string | null
	primary: boolean
	titleId: string | null
	descriptionText: string | null
	locationOnly: boolean
	serviceOnly: boolean
	published: boolean
	deleted: boolean
}

type EmailUpdateInput = {
	id: string
	orgId: string
	firstName?: string | null
	lastName?: string | null
	primary?: boolean
	email?: string
	published?: boolean
	deleted?: boolean
	titleId?: string | null
	locationOnly?: boolean
	serviceOnly?: boolean
	description?: string | null
	descriptionId?: string | null
	linkLocationId?: string | null
}

/** Seed data accepted by `createFakeOrgEmailBackend` - a raw row, defaults filled in like the DB would. */
export type SeedEmail = Partial<OrgEmailRow> & { email: string }

/**
 * Fakes the orgEmail backend the same way `createFakeOrgPhoneBackend` above does for orgPhone - verified
 * directly against the real handlers on 2026-09-24
 * (packages/api/router/orgEmail/{query.forContactInfoEdit,query.forContactInfo,query.forEditDrawer,
 * mutation.update,query.getLinkOptions,mutation.locationLink}.handler.ts). Deliberately simplified vs. the
 * real schema in one place: the real `organization`/`locations` relations on `OrgEmail` are to-many join
 * tables (an email could in principle belong to more than one org), but every real caller only ever attaches
 * one - same one-org-per-row simplification `createFakeOrgPhoneBackend` already makes for orgPhone.
 */
export const createFakeOrgEmailBackend = () => {
	const emails = new Map<string, OrgEmailRow>()
	const orgLinks = new Map<string, string>() // emailId -> organizationId
	const locationLinks = new Set<string>() // `${locationId}:${emailId}`

	const seedOrgEmail = (seed: SeedEmail, { orgId = ORG.id }: { orgId?: string } = {}) => {
		const row: OrgEmailRow = {
			id: generateId('orgEmail'),
			firstName: null,
			lastName: null,
			primary: false,
			titleId: null,
			descriptionText: null,
			locationOnly: false,
			serviceOnly: false,
			published: true,
			deleted: false,
			...seed,
		}
		emails.set(row.id, row)
		orgLinks.set(row.id, orgId)
		return row
	}

	const linkToLocation = (locationId: string, emailId: string) => {
		locationLinks.add(`${locationId}:${emailId}`)
	}

	const reformat = (row: OrgEmailRow) => ({
		id: row.id,
		deleted: row.deleted,
		// A real `descriptionId` is an opaque FK the client never inspects directly - a stable
		// synthetic value is enough for identity/presence checks.
		descriptionId: row.descriptionText ? `freeText_${row.id}` : null,
		email: row.email,
		firstName: row.firstName,
		lastName: row.lastName,
		locationOnly: row.locationOnly,
		primary: row.primary,
		published: row.published,
		serviceOnly: row.serviceOnly,
		titleId: row.titleId,
		description: row.descriptionText,
	})

	// --- procedure implementations, matching the real handlers' contracts -------------------------

	const forEditDrawer = (input: { id: string }) => {
		const row = emails.get(input.id)
		return row ? reformat(row) : null
	}

	const update = (input: EmailUpdateInput) => {
		if (input.email) {
			let row = emails.get(input.id)
			if (!row) {
				row = seedOrgEmail(
					{
						id: input.id,
						email: input.email,
						firstName: input.firstName ?? null,
						lastName: input.lastName ?? null,
						primary: input.primary ?? false,
						titleId: input.titleId ?? null,
						descriptionText: input.description ?? null,
						locationOnly: input.locationOnly ?? false,
						serviceOnly: input.serviceOnly ?? false,
						published: input.published ?? true,
						deleted: input.deleted ?? false,
					},
					{ orgId: input.orgId }
				)
				// Real handler: a location-context create links ONLY to that location, not the org
				// (`linkLocationId ? {locations: ...} : {organization: ...}`) - mirrored here by
				// removing the org link `seedOrgEmail` just added above when a location was given.
				if (input.linkLocationId) {
					orgLinks.delete(row.id)
					linkToLocation(input.linkLocationId, row.id)
				}
			} else {
				const next: OrgEmailRow = {
					...row,
					...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
					...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
					...(input.primary !== undefined ? { primary: input.primary } : {}),
					email: input.email,
					...(input.published !== undefined ? { published: input.published } : {}),
					...(input.deleted !== undefined ? { deleted: input.deleted } : {}),
					...(input.titleId !== undefined ? { titleId: input.titleId } : {}),
					...(input.locationOnly !== undefined ? { locationOnly: input.locationOnly } : {}),
					...(input.serviceOnly !== undefined ? { serviceOnly: input.serviceOnly } : {}),
					...(input.description !== undefined ? { descriptionText: input.description } : {}),
				}
				emails.set(next.id, next)
				row = next
			}
			return reformat(row)
		}

		const existing = emails.get(input.id)
		if (!existing) {
			throw new TRPCClientError(`orgEmail ${input.id} not found`)
		}
		const next: OrgEmailRow = {
			...existing,
			...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
			...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
			...(input.primary !== undefined ? { primary: input.primary } : {}),
			...(input.published !== undefined ? { published: input.published } : {}),
			...(input.deleted !== undefined ? { deleted: input.deleted } : {}),
			...(input.titleId !== undefined ? { titleId: input.titleId } : {}),
			...(input.locationOnly !== undefined ? { locationOnly: input.locationOnly } : {}),
			...(input.serviceOnly !== undefined ? { serviceOnly: input.serviceOnly } : {}),
			...(input.description !== undefined ? { descriptionText: input.description } : {}),
		}
		emails.set(next.id, next)
		return reformat(next)
	}

	const forContactInfoEdit = (input: { parentId: string }) => {
		const rows = [...emails.values()]
			.filter((row) => {
				if (orgLinks.get(row.id) === input.parentId) {
					return true
				}
				return locationLinks.has(`${input.parentId}:${row.id}`)
			})
			.sort((a, b) => Number(b.published) - Number(a.published) || Number(a.deleted) - Number(b.deleted))
		return rows.map((row) => ({
			id: row.id,
			email: row.email,
			firstName: row.firstName,
			lastName: row.lastName,
			primary: row.primary,
			title: row.titleId ? { key: `userTitle_${row.titleId}` } : null,
			description: row.descriptionText
				? { key: `emailDesc_${row.id}`, defaultText: row.descriptionText }
				: null,
			locationOnly: row.locationOnly,
			serviceOnly: row.serviceOnly,
			published: row.published,
			deleted: row.deleted,
		}))
	}

	const forContactInfo = (input: { parentId: string; locationOnly?: boolean; serviceOnly?: boolean }) => {
		const rows = [...emails.values()]
			.filter((row) => {
				if (row.deleted || !row.published) {
					return false
				}
				if (orgLinks.get(row.id) !== input.parentId && !locationLinks.has(`${input.parentId}:${row.id}`)) {
					return false
				}
				if (input.locationOnly !== undefined && row.locationOnly !== input.locationOnly) {
					return false
				}
				if (input.serviceOnly !== undefined && row.serviceOnly !== input.serviceOnly) {
					return false
				}
				return true
			})
			.sort((a, b) => Number(b.primary) - Number(a.primary))
		return rows.map((row) => ({
			id: row.id,
			email: row.email,
			firstName: row.firstName,
			lastName: row.lastName,
			primary: row.primary,
			title: row.titleId ? { key: `userTitle_${row.titleId}` } : null,
			description: row.descriptionText
				? { key: `emailDesc_${row.id}`, defaultText: row.descriptionText }
				: null,
			locationOnly: row.locationOnly,
			serviceOnly: row.serviceOnly,
		}))
	}

	const getLinkOptions = (input: { slug: string; locationId: string }) => {
		return [...emails.values()]
			.filter((row) => orgLinks.get(row.id) === ORG.id)
			.filter((row) => !locationLinks.has(`${input.locationId}:${row.id}`))
			.map((row) => ({
				id: row.id,
				firstName: row.firstName,
				lastName: row.lastName,
				email: row.email,
				published: row.published,
				deleted: row.deleted,
				description: row.descriptionText,
			}))
	}

	const locationLink = (input: { orgEmailId: string; orgLocationId: string; action: 'link' | 'unlink' }) => {
		const key = `${input.orgLocationId}:${input.orgEmailId}`
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
		return { orgLocationId: input.orgLocationId, orgEmailId: input.orgEmailId, active: true }
	}

	const handlers = [
		http.get(`${BASE_URL}/orgEmail.forEditDrawer`, ({ request }) =>
			respond(request, (input) => forEditDrawer(input as { id: string }))
		),
		http.post(`${BASE_URL}/orgEmail.update`, ({ request }) =>
			respond(request, (input) => update(input as EmailUpdateInput))
		),
		http.get(`${BASE_URL}/orgEmail.forContactInfoEdit`, ({ request }) =>
			respond(request, (input) => forContactInfoEdit(input as { parentId: string }))
		),
		http.get(`${BASE_URL}/orgEmail.forContactInfo`, ({ request }) =>
			respond(request, (input) =>
				forContactInfo(input as { parentId: string; locationOnly?: boolean; serviceOnly?: boolean })
			)
		),
		http.get(`${BASE_URL}/orgEmail.getLinkOptions`, ({ request }) =>
			respond(request, (input) => getLinkOptions(input as { slug: string; locationId: string }))
		),
		http.post(`${BASE_URL}/orgEmail.locationLink`, ({ request }) =>
			respond(request, (input) =>
				locationLink(input as { orgEmailId: string; orgLocationId: string; action: 'link' | 'unlink' })
			)
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

	return { handlers, emails, orgLinks, locationLinks, seedOrgEmail, linkToLocation }
}

interface OrgWebsiteRow {
	id: string
	url: string
	descriptionText: string | null
	orgLocationOnly: boolean
	isPrimary: boolean
	published: boolean
	deleted: boolean
}

type WebsiteUpsertInput = {
	operation: 'create' | 'update'
	id?: string
	url?: string
	description?: string | null
	isPrimary?: boolean
	published?: boolean
	deleted?: boolean
	organizationId?: string
	orgLocationId?: string | null
	orgLocationOnly?: boolean
}

/** Seed data accepted by `createFakeOrgWebsiteBackend` - a raw row, defaults filled in like the DB would. */
export type SeedWebsite = Partial<OrgWebsiteRow> & { url: string }

/**
 * Fakes the orgWebsite backend the same way `createFakeOrgPhoneBackend` above does for orgPhone - verified
 * directly against the real handlers on 2026-09-24
 * (packages/api/router/orgWebsite/{query.forContactInfoEdit,query.forContactInfo,query.forEditDrawer,
 * mutation.upsert,query.getLinkOptions,mutation.locationLink}.handler.ts). Unlike orgEmail, orgWebsite's
 * `organization` relation is a direct one-to-one FK (not a to-many join table), matching orgPhone's shape -
 * `orgLinks` below is a real 1:1 map, not a simplification.
 */
export const createFakeOrgWebsiteBackend = () => {
	const websites = new Map<string, OrgWebsiteRow>()
	const orgLinks = new Map<string, string>() // websiteId -> organizationId
	const locationLinks = new Set<string>() // `${locationId}:${websiteId}`

	const seedOrgWebsite = (seed: SeedWebsite, { orgId = ORG.id }: { orgId?: string } = {}) => {
		const row: OrgWebsiteRow = {
			id: generateId('orgWebsite'),
			descriptionText: null,
			orgLocationOnly: false,
			isPrimary: false,
			published: true,
			deleted: false,
			...seed,
		}
		websites.set(row.id, row)
		orgLinks.set(row.id, orgId)
		return row
	}

	const linkToLocation = (locationId: string, websiteId: string) => {
		locationLinks.add(`${locationId}:${websiteId}`)
	}

	const reformat = (row: OrgWebsiteRow) => ({
		id: row.id,
		url: row.url,
		descriptionId: row.descriptionText ? `freeText_${row.id}` : null,
		organizationId: orgLinks.get(row.id) ?? null,
		orgLocationOnly: row.orgLocationOnly,
		createdAt: new Date(0),
		updatedAt: new Date(0),
		isPrimary: row.isPrimary,
		deleted: row.deleted,
		published: row.published,
	})

	// --- procedure implementations, matching the real handlers' contracts -------------------------

	const forEditDrawer = (input: { id: string }) => {
		const row = websites.get(input.id)
		return row ? { ...reformat(row), description: row.descriptionText ?? undefined } : null
	}

	const upsert = (input: WebsiteUpsertInput) => {
		if (input.operation === 'create') {
			if (!input.url || !input.organizationId) {
				throw new TRPCClientError('url and organizationId are required to create a website')
			}
			const id = input.id ?? generateId('orgWebsite')
			const row = seedOrgWebsite(
				{
					id,
					url: input.url,
					descriptionText: input.description ?? null,
					orgLocationOnly: input.orgLocationOnly ?? false,
					isPrimary: input.isPrimary ?? false,
					published: input.published ?? true,
					deleted: input.deleted ?? false,
				},
				{ orgId: input.organizationId }
			)
			if (input.orgLocationId) {
				linkToLocation(input.orgLocationId, row.id)
			}
			return reformat(row)
		}

		const existing = input.id ? websites.get(input.id) : undefined
		if (!existing) {
			throw new TRPCClientError(`orgWebsite ${input.id} not found`)
		}
		const next: OrgWebsiteRow = {
			...existing,
			...(input.url !== undefined ? { url: input.url } : {}),
			...(input.description !== undefined ? { descriptionText: input.description } : {}),
			...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}),
			...(input.published !== undefined ? { published: input.published } : {}),
			...(input.deleted !== undefined ? { deleted: input.deleted } : {}),
			...(input.orgLocationOnly !== undefined ? { orgLocationOnly: input.orgLocationOnly } : {}),
		}
		websites.set(next.id, next)
		return reformat(next)
	}

	const forContactInfoEdit = (input: { parentId: string }) => {
		const rows = [...websites.values()]
			.filter((row) => {
				if (orgLinks.get(row.id) === input.parentId) {
					return true
				}
				return locationLinks.has(`${input.parentId}:${row.id}`)
			})
			.sort((a, b) => Number(b.published) - Number(a.published) || Number(a.deleted) - Number(b.deleted))
		return rows.map((row) => ({
			id: row.id,
			url: row.url,
			description: row.descriptionText
				? { key: `websiteDesc_${row.id}`, defaultText: row.descriptionText }
				: null,
			published: row.published,
			deleted: row.deleted,
		}))
	}

	const forContactInfo = (input: { parentId: string; locationOnly?: boolean }) => {
		const rows = [...websites.values()]
			.filter((row) => {
				if (row.deleted || !row.published) {
					return false
				}
				if (orgLinks.get(row.id) !== input.parentId && !locationLinks.has(`${input.parentId}:${row.id}`)) {
					return false
				}
				if (input.locationOnly !== undefined && row.orgLocationOnly !== input.locationOnly) {
					return false
				}
				return true
			})
			.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
		return rows.map((row) => ({
			id: row.id,
			url: row.url,
			isPrimary: row.isPrimary,
			description: row.descriptionText
				? { key: `websiteDesc_${row.id}`, defaultText: row.descriptionText }
				: null,
			orgLocationOnly: row.orgLocationOnly,
		}))
	}

	const getLinkOptions = (input: { slug: string; locationId: string }) => {
		return [...websites.values()]
			.filter((row) => orgLinks.get(row.id) === ORG.id)
			.filter((row) => !locationLinks.has(`${input.locationId}:${row.id}`))
			.map((row) => ({
				id: row.id,
				url: row.url,
				published: row.published,
				deleted: row.deleted,
				description: row.descriptionText,
			}))
	}

	const locationLink = (input: {
		orgWebsiteId: string
		orgLocationId: string
		action: 'link' | 'unlink'
	}) => {
		const key = `${input.orgLocationId}:${input.orgWebsiteId}`
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
		return { orgLocationId: input.orgLocationId, orgWebsiteId: input.orgWebsiteId, active: true }
	}

	const handlers = [
		http.get(`${BASE_URL}/orgWebsite.forEditDrawer`, ({ request }) =>
			respond(request, (input) => forEditDrawer(input as { id: string }))
		),
		http.post(`${BASE_URL}/orgWebsite.upsert`, ({ request }) =>
			respond(request, (input) => upsert(input as WebsiteUpsertInput))
		),
		http.get(`${BASE_URL}/orgWebsite.forContactInfoEdit`, ({ request }) =>
			respond(request, (input) => forContactInfoEdit(input as { parentId: string }))
		),
		http.get(`${BASE_URL}/orgWebsite.forContactInfo`, ({ request }) =>
			respond(request, (input) => forContactInfo(input as { parentId: string; locationOnly?: boolean }))
		),
		http.get(`${BASE_URL}/orgWebsite.getLinkOptions`, ({ request }) =>
			respond(request, (input) => getLinkOptions(input as { slug: string; locationId: string }))
		),
		http.post(`${BASE_URL}/orgWebsite.locationLink`, ({ request }) =>
			respond(request, (input) =>
				locationLink(input as { orgWebsiteId: string; orgLocationId: string; action: 'link' | 'unlink' })
			)
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

	return { handlers, websites, orgLinks, locationLinks, seedOrgWebsite, linkToLocation }
}

// `SocialMediaDrawer`'s form schema validates `service.id` against `prefixedId('socialMediaService')`
// (pattern `/^smsv_\w+$/`) - a plain hand-written string like `'socialMediaService_facebook'` fails
// that check silently (the zod resolver just blocks submission with no visible error), so these use
// real generated ids the same way `ORG`/`LOCATION` above do.
export const SOCIAL_MEDIA_SERVICES = [
	{
		id: generateId('socialMediaService'),
		active: true,
		internal: false,
		logoIcon: 'carbon:logo-facebook',
		name: 'Facebook',
		urlBase: 'facebook.com',
	},
	{
		id: generateId('socialMediaService'),
		active: true,
		internal: false,
		logoIcon: 'carbon:logo-instagram',
		name: 'Instagram',
		urlBase: 'instagram.com',
	},
] as const

interface OrgSocialMediaRow {
	id: string
	username: string
	url: string
	serviceId: string
	orgLocationOnly: boolean
	published: boolean
	deleted: boolean
}

type SocialMediaUpsertInput = {
	operation: 'create' | 'update'
	id?: string
	username?: string
	url?: string
	published?: boolean
	deleted?: boolean
	serviceId?: string
	organizationId?: string | null
	orgLocationId?: string | null
	orgLocationOnly?: boolean
}

/** Seed data accepted by `createFakeOrgSocialMediaBackend` - a raw row, defaults filled in like the DB would. */
export type SeedSocialMedia = Partial<OrgSocialMediaRow> & {
	url: string
	username: string
	serviceId: string
}

/**
 * Fakes the orgSocialMedia backend the same way `createFakeOrgPhoneBackend` above does for orgPhone -
 * verified directly against the real handlers on 2026-09-24
 * (packages/api/router/orgSocialMedia/{query.forContactInfoEdits,query.forContactInfo,
 * query.forEditDrawer,mutation.upsert,query.getServiceTypes,query.getLinkOptions,
 * mutation.locationLink}.handler.ts). One deliberate divergence: the real `forContactInfo` handler filters on
 * a `locationOnly` where-clause key that doesn't match the model's actual `orgLocationOnly` field (apparent
 * pre-existing bug, out of scope here) - this fake filters on the real `orgLocationOnly` field instead, since
 * nothing under test exercises that filter either way.
 */
export const createFakeOrgSocialMediaBackend = () => {
	const socials = new Map<string, OrgSocialMediaRow>()
	const orgLinks = new Map<string, string>() // socialMediaId -> organizationId
	const locationLinks = new Set<string>() // `${locationId}:${socialMediaId}`

	const seedOrgSocialMedia = (seed: SeedSocialMedia, { orgId = ORG.id }: { orgId?: string } = {}) => {
		const row: OrgSocialMediaRow = {
			id: generateId('orgSocialMedia'),
			orgLocationOnly: false,
			published: true,
			deleted: false,
			...seed,
		}
		socials.set(row.id, row)
		orgLinks.set(row.id, orgId)
		return row
	}

	const linkToLocation = (locationId: string, socialMediaId: string) => {
		locationLinks.add(`${locationId}:${socialMediaId}`)
	}

	const serviceFor = (serviceId: string) => SOCIAL_MEDIA_SERVICES.find((s) => s.id === serviceId)

	const reformat = (row: OrgSocialMediaRow) => ({
		id: row.id,
		legacyId: null,
		username: row.username,
		url: row.url,
		deleted: row.deleted,
		published: row.published,
		serviceId: row.serviceId,
		organizationId: orgLinks.get(row.id) ?? null,
		orgLocationOnly: row.orgLocationOnly,
		createdAt: new Date(0),
		updatedAt: new Date(0),
	})

	// --- procedure implementations, matching the real handlers' contracts -------------------------

	const forEditDrawer = (input: { id: string }) => {
		const row = socials.get(input.id)
		if (!row) {
			return null
		}
		const service = serviceFor(row.serviceId)
		return {
			id: row.id,
			username: row.username,
			url: row.url,
			deleted: row.deleted,
			published: row.published,
			serviceId: row.serviceId,
			organizationId: orgLinks.get(row.id) ?? null,
			locations: [...locationLinks]
				.filter((key) => key.endsWith(`:${row.id}`))
				.map((key) => ({ orgLocationId: key.split(':')[0] ?? '' })),
			orgLocationOnly: row.orgLocationOnly,
			service: service ? { id: service.id, name: service.name, logoIcon: service.logoIcon } : null,
		}
	}

	const upsert = (input: SocialMediaUpsertInput) => {
		if (input.operation === 'create') {
			if (!input.url || !input.serviceId || !input.username) {
				throw new TRPCClientError('url, username, and serviceId are required to create a social media entry')
			}
			const id = input.id ?? generateId('orgSocialMedia')
			const row = seedOrgSocialMedia(
				{
					id,
					url: input.url,
					username: input.username,
					serviceId: input.serviceId,
					orgLocationOnly: input.orgLocationOnly ?? false,
					published: input.published ?? true,
					deleted: input.deleted ?? false,
				},
				{ orgId: input.organizationId ?? ORG.id }
			)
			if (input.orgLocationId) {
				linkToLocation(input.orgLocationId, row.id)
			}
			return reformat(row)
		}

		const existing = input.id ? socials.get(input.id) : undefined
		if (!existing) {
			throw new TRPCClientError(`orgSocialMedia ${input.id} not found`)
		}
		// Real handler: on `update`, only `published`/`deleted`/`orgLocationOnly` are actually
		// written - `url`/`username`/`serviceId` are create-only fields, dropped from `data` before
		// the Prisma call. Mirrored here by simply never applying them below, even if present on
		// `input`.
		const next: OrgSocialMediaRow = {
			...existing,
			...(input.published !== undefined ? { published: input.published } : {}),
			...(input.deleted !== undefined ? { deleted: input.deleted } : {}),
			...(input.orgLocationOnly !== undefined ? { orgLocationOnly: input.orgLocationOnly } : {}),
		}
		socials.set(next.id, next)
		return reformat(next)
	}

	const forContactInfoEdits = (input: { parentId: string }) => {
		const rows = [...socials.values()].filter((row) => {
			if (orgLinks.get(row.id) === input.parentId) {
				return true
			}
			return locationLinks.has(`${input.parentId}:${row.id}`)
		})
		return rows.map((row) => {
			const service = serviceFor(row.serviceId)
			return {
				id: row.id,
				url: row.url,
				username: row.username,
				orgLocationOnly: row.orgLocationOnly,
				published: row.published,
				deleted: row.deleted,
				service: service?.name,
				serviceIcon: service?.logoIcon,
			}
		})
	}

	const forContactInfo = (input: { parentId: string; locationOnly?: boolean }) => {
		const rows = [...socials.values()].filter((row) => {
			if (row.deleted || !row.published) {
				return false
			}
			if (orgLinks.get(row.id) !== input.parentId && !locationLinks.has(`${input.parentId}:${row.id}`)) {
				return false
			}
			if (input.locationOnly !== undefined && row.orgLocationOnly !== input.locationOnly) {
				return false
			}
			return true
		})
		return rows.map((row) => {
			const service = serviceFor(row.serviceId)
			return {
				id: row.id,
				url: row.url,
				username: row.username,
				orgLocationOnly: row.orgLocationOnly,
				service: service?.name,
				serviceIcon: service?.logoIcon,
			}
		})
	}

	const getServiceTypes = () => SOCIAL_MEDIA_SERVICES.map((s) => ({ ...s }))

	const getLinkOptions = (input: { slug: string; locationId: string }) => {
		return [...socials.values()]
			.filter((row) => orgLinks.get(row.id) === ORG.id)
			.filter((row) => !locationLinks.has(`${input.locationId}:${row.id}`))
			.map((row) => {
				const service = serviceFor(row.serviceId)
				return {
					id: row.id,
					url: row.url,
					published: row.published,
					deleted: row.deleted,
					service: service ? { name: service.name, logoIcon: service.logoIcon } : { name: '', logoIcon: '' },
				}
			})
	}

	const locationLink = (input: {
		orgSocialMediaId: string
		orgLocationId: string
		action: 'link' | 'unlink'
	}) => {
		const key = `${input.orgLocationId}:${input.orgSocialMediaId}`
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
		return { orgLocationId: input.orgLocationId, socialMediaId: input.orgSocialMediaId, active: true }
	}

	const handlers = [
		http.get(`${BASE_URL}/orgSocialMedia.forEditDrawer`, ({ request }) =>
			respond(request, (input) => forEditDrawer(input as { id: string }))
		),
		http.post(`${BASE_URL}/orgSocialMedia.upsert`, ({ request }) =>
			respond(request, (input) => upsert(input as SocialMediaUpsertInput))
		),
		http.get(`${BASE_URL}/orgSocialMedia.forContactInfoEdits`, ({ request }) =>
			respond(request, (input) => forContactInfoEdits(input as { parentId: string }))
		),
		http.get(`${BASE_URL}/orgSocialMedia.forContactInfo`, ({ request }) =>
			respond(request, (input) => forContactInfo(input as { parentId: string; locationOnly?: boolean }))
		),
		http.get(`${BASE_URL}/orgSocialMedia.getServiceTypes`, ({ request }) =>
			respond(request, getServiceTypes)
		),
		http.get(`${BASE_URL}/orgSocialMedia.getLinkOptions`, ({ request }) =>
			respond(request, (input) => getLinkOptions(input as { slug: string; locationId: string }))
		),
		http.post(`${BASE_URL}/orgSocialMedia.locationLink`, ({ request }) =>
			respond(request, (input) =>
				locationLink(input as { orgSocialMediaId: string; orgLocationId: string; action: 'link' | 'unlink' })
			)
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

	return { handlers, socials, orgLinks, locationLinks, seedOrgSocialMedia, linkToLocation }
}

/**
 * Country/gov-dist fixture matching `fieldOpt.govDistsByCountryNoSub`'s actual output shape (unlike the
 * simpler `COUNTRIES` fixture above, used only by the orgPhone backend, which has no `govDist` nesting at
 * all) - `AddressDrawer` resolves both its Country and State selects, and the labels shown on
 * `forVisitCardEdits`, from this one query.
 */
export const GEO_COUNTRIES = [
	{
		id: generateId('country'),
		tsKey: 'US',
		tsNs: 'country',
		cca2: 'US',
		flag: '🇺🇸',
		activeForOrgs: true,
		govDist: [
			{ id: generateId('govDist'), tsKey: 'CA', tsNs: 'gov-dist', abbrev: 'CA' },
			{ id: generateId('govDist'), tsKey: 'NY', tsNs: 'gov-dist', abbrev: 'NY' },
		],
	},
] as const

interface OrgLocationRow {
	id: string
	name: string | null
	street1: string | null
	street2: string | null
	city: string
	postCode: string | null
	countryId: string
	govDistId: string | null
	latitude: number | null
	longitude: number | null
	mailOnly: boolean
	published: boolean
	deleted: boolean
	addressVisibility: 'FULL' | 'PARTIAL' | 'HIDDEN'
	accessible: { supplementId?: string; boolean?: boolean | null }
	services: string[]
}

type LocationUpdateInput = {
	id: string
	data: Partial<OrgLocationRow> & { accessible?: OrgLocationRow['accessible'] }
}

/** Seed data accepted by `createFakeLocationBackend` - a raw row, defaults filled in like the DB would. */
export type SeedLocation = Partial<OrgLocationRow> & { city: string; countryId: string }

/**
 * Fakes the `location` (address-editing slice) and `fieldOpt.govDistsByCountryNoSub` backend the same way
 * `createFakeOrgPhoneBackend` above does for orgPhone - verified directly against the real handlers on
 * 2026-09-24 (packages/api/router/location/{query.getAddress,query.forVisitCardEdits,
 * mutation.update,lib.formatAddressVisibility}.handler.ts, fieldOpt/query.govDistsByCountryNoSub).
 * `geo.autocomplete`/`geo.geoByPlaceId` are also faked (seed with `seedAutocomplete`/`seedGeocode`), keyed on
 * the exact debounce-settled `search` string / `placeId` a test expects the component to request - a test
 * that types into the address-autocomplete field without seeding a matching entry gets an empty
 * results/ZERO_RESULTS response rather than an unhandled-request failure. Deliberately out of scope:
 * `location.forLocationCard`/`forLocationPageEdits`/`forVisitCard` (not rendered by anything
 * `AddressDrawer`/`VisitCard`'s own tests mount).
 */
export interface FakeAutocompleteResult {
	value: string
	label: string
	subheading?: string
	placeId: string
}

interface FakeGeocodeResult {
	streetNumber?: string
	streetName?: string
	street2?: string
	city?: string
	govDist?: string
	postCode?: string
	country?: string
	lat: number
	lng: number
}

export const createFakeLocationBackend = () => {
	const locations = new Map<string, OrgLocationRow>()
	const autocompleteResults = new Map<string, FakeAutocompleteResult[]>()
	const geocodeResults = new Map<string, FakeGeocodeResult>()

	/** Keyed on the exact `search` string the component will debounce-settle on. */
	const seedAutocomplete = (search: string, results: FakeAutocompleteResult[]) => {
		autocompleteResults.set(search, results)
	}
	const seedGeocode = (placeId: string, result: FakeGeocodeResult) => {
		geocodeResults.set(placeId, result)
	}

	const seedLocation = (seed: SeedLocation) => {
		const row: OrgLocationRow = {
			id: generateId('orgLocation'),
			name: null,
			street1: null,
			street2: null,
			postCode: null,
			govDistId: null,
			latitude: null,
			longitude: null,
			mailOnly: false,
			published: true,
			deleted: false,
			addressVisibility: 'FULL',
			accessible: {},
			services: [],
			...seed,
		}
		locations.set(row.id, row)
		return row
	}

	// Mirrors packages/api/router/location/lib.formatAddressVisibility.ts exactly (isEditMode always
	// true here, matching what `forVisitCardEdits`'s real handler passes).
	const applyVisibilityEditMode = (row: OrgLocationRow) => {
		const address = {
			street1: row.street1,
			street2: row.street2,
			city: row.city as string | null,
			postCode: row.postCode,
			latitude: row.latitude,
			longitude: row.longitude,
		}
		if (row.addressVisibility === 'FULL') {
			return address
		}
		return { ...address, street1: null, street2: null, postCode: null, latitude: null, longitude: null }
	}

	// --- procedure implementations, matching the real handlers' contracts -------------------------

	const getAddress = (input: string) => {
		const row = locations.get(input)
		if (!row) {
			throw new TRPCClientError(`orgLocation ${input} not found`)
		}
		const { id, services, accessible, ...rest } = row
		return { id, data: { ...rest, accessible, services } }
	}

	const forVisitCardEdits = (input: string) => {
		const row = locations.get(input)
		if (!row) {
			return null
		}
		const countryEntry = GEO_COUNTRIES.find((c) => c.id === row.countryId)
		const govDistEntry = countryEntry?.govDist.find((g) => g.id === row.govDistId)
		return {
			id: row.id,
			name: row.name,
			country: countryEntry ? { cca2: countryEntry.cca2 } : { cca2: '' },
			govDist: govDistEntry
				? { abbrev: govDistEntry.abbrev, tsKey: govDistEntry.tsKey, tsNs: govDistEntry.tsNs }
				: null,
			addressVisibility: row.addressVisibility,
			remote: undefined,
			accessible: row.accessible.boolean,
			...applyVisibilityEditMode(row),
		}
	}

	const update = (input: LocationUpdateInput) => {
		const existing = locations.get(input.id)
		if (!existing) {
			throw new TRPCClientError(`orgLocation ${input.id} not found`)
		}
		const { accessible, ...rest } = input.data
		const next: OrgLocationRow = {
			...existing,
			...rest,
			accessible: accessible !== undefined ? { ...existing.accessible, ...accessible } : existing.accessible,
		}
		locations.set(next.id, next)
		// Real handler's Prisma call uses `select: { id: true }` - only the id is ever returned.
		return { id: next.id }
	}

	const govDistsByCountryNoSub = () => GEO_COUNTRIES.map((c) => ({ ...c, govDist: [...c.govDist] }))

	// Mirrors the real `geo.autocomplete` handler's output shape (`packages/api/schemas/thirdParty/
	// googleGeo.ts`'s `autocompleteResponse` transform) closely enough for `AddressDrawer`'s own
	// `AddressAutocompleteField`/`AddressAutocomplete`'s consumption - only `results` is ever read.
	const autocomplete = (input: { search: string }) => ({
		status: 'OK' as const,
		results: autocompleteResults.get(input.search) ?? [],
	})
	// Mirrors `geo.geoByPlaceId`'s output shape - only `result` (and its presence/absence) is read.
	const geoByPlaceId = (placeId: string) => {
		const result = geocodeResults.get(placeId)
		if (!result) {
			return { status: 'ZERO_RESULTS' as const, result: undefined }
		}
		const { lat, lng, ...rest } = result
		return { status: 'OK' as const, result: { ...rest, geometry: { location: { lat, lng } } } }
	}

	const handlers = [
		http.get(`${BASE_URL}/location.getAddress`, ({ request }) =>
			respond(request, (input) => getAddress(input as string))
		),
		http.get(`${BASE_URL}/location.forVisitCardEdits`, ({ request }) =>
			respond(request, (input) => forVisitCardEdits(input as string))
		),
		http.post(`${BASE_URL}/location.update`, ({ request }) =>
			respond(request, (input) => update(input as LocationUpdateInput))
		),
		http.get(`${BASE_URL}/fieldOpt.govDistsByCountryNoSub`, ({ request }) =>
			respond(request, govDistsByCountryNoSub)
		),
		http.get(`${BASE_URL}/service.getNames`, ({ request }) => respond(request, () => [])),
		http.get(`${BASE_URL}/geo.autocomplete`, ({ request }) =>
			respond(request, (input) => autocomplete(input as { search: string }))
		),
		http.get(`${BASE_URL}/geo.geoByPlaceId`, ({ request }) =>
			respond(request, (input) => geoByPlaceId(input as string))
		),
	]

	return { handlers, locations, seedLocation, seedAutocomplete, seedGeocode }
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
// Simulates network delay in a test-only fake backend, not a security-sensitive context that needs
// cryptographic randomness.
const jitter = () => (NETWORK_JITTER_MS > 0 ? Math.random() * NETWORK_JITTER_MS : 0) // NOSONAR

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
