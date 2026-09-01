import { faker } from '@faker-js/faker'
import { type HttpHandler } from 'msw'

import { type ApiOutput } from '@weareinreach/api'
import { OrgUnpublishedReason } from '@weareinreach/db/enums'
import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

type StatusFilterValue = 'published' | 'new' | 'in-progress' | 'waiting' | 'inactive' | 'unaffirming'

// Matches STATUS_FILTER_TO_REASON in query.forOrganizationTable.handler.ts.
const STATUS_FILTER_TO_REASON: Record<Exclude<StatusFilterValue, 'published'>, OrgUnpublishedReason> = {
	new: OrgUnpublishedReason.NEW,
	'in-progress': OrgUnpublishedReason.IN_PROGRESS,
	waiting: OrgUnpublishedReason.WAITING,
	inactive: OrgUnpublishedReason.INACTIVE,
	unaffirming: OrgUnpublishedReason.UNAFFIRMING,
}

// Matches by parsed hostname rather than raw substring, so e.g. `notexample.org.evil.com` isn't
// mistaken for `example.org` the way a plain `.includes()` check would.
const matchesDomain = (website: string, domain: string): boolean => {
	if (!website) {
		return false
	}
	try {
		const { hostname } = new URL(website.includes('://') ? website : `https://${website}`)
		return hostname === domain || hostname.endsWith(`.${domain}`)
	} catch {
		return false
	}
}

const existingOrg = (input: string): ApiOutput['organization']['checkForExisting'] => {
	const name = 'Existing Organization'
	const regex = new RegExp(`.*${input}.*`, 'gi')
	if (regex.test(name)) {
		return {
			name,
			published: true,
			slug: 'existing-org',
		}
	}
	return null
}
type ForOrgTableRow = ApiOutput['organization']['forOrganizationTable']['results'][number]
type ForOrgTableSortKey = 'name' | 'lastVerified' | 'updatedAt' | 'createdAt'

const generateFakeLocations = (lastVerified: Date): ForOrgTableRow['locations'] => {
	const totalLocations = faker.number.int({ min: 0, max: 7 })
	const locations: ForOrgTableRow['locations'] = []
	for (let locIdx = 0; locIdx < totalLocations; locIdx++) {
		const updatedAt = faker.date.past({ refDate: lastVerified })
		const createdAt = faker.date.past({ refDate: updatedAt })
		locations.push({
			id: `oloc_${faker.string.alphanumeric({ length: 26, casing: 'upper' })}`,
			name: `${faker.location.street()} location`,
			published: faker.datatype.boolean(0.9),
			deleted: faker.datatype.boolean(0.05),
			updatedAt,
			createdAt,
		})
	}
	return locations
}

const generateFakeOrgs = (totalRecords: number): ForOrgTableRow[] => {
	faker.seed(1024)
	const allResults: ForOrgTableRow[] = []
	for (let index = 0; index < totalRecords; index++) {
		const lastVerified = faker.date.past()
		const updatedAt = faker.date.past({ refDate: lastVerified })
		const createdAt = faker.date.past({ refDate: updatedAt })
		// Organization.source is a required relation (never null) - most fixtures get a realistic
		// non-suggestion source, some get 'suggestion'/'data-portal' to demo the new filter/column.
		const source = faker.helpers.arrayElement([
			{ source: 'migration' },
			{ source: 'migration' },
			{ source: 'migration' },
			{ source: 'spreadsheet upload' },
			{ source: 'suggestion' },
			{ source: 'data-portal' },
		])
		// Snapshotted at creation time in real usage - data-portal orgs are always staff (permission-gated
		// at the mutation itself), suggestion orgs are a realistic mix, everything else is null (n/a).
		const creatorHadDpAccess =
			source.source === 'data-portal'
				? true
				: source.source === 'suggestion'
					? faker.datatype.boolean(0.4)
					: null
		const published = faker.datatype.boolean(0.9)
		// Null when published (matches the real handler clearing it on publish) - otherwise a realistic
		// mix of the five reason values.
		const unpublishedReason = published
			? null
			: faker.helpers.arrayElement(Object.values(OrgUnpublishedReason))
		allResults.push({
			id: `orgn_${faker.string.alphanumeric({ length: 26, casing: 'upper' })}`,
			name: faker.company.name(),
			slug: faker.lorem.slug(3),
			lastVerified: faker.helpers.maybe(() => lastVerified, { probability: 0.9 }) ?? null,
			published,
			unpublishedReason,
			deleted: faker.datatype.boolean(0.05),
			locations: generateFakeLocations(lastVerified),
			source,
			creatorHadDpAccess,
			updatedAt,
			createdAt,
		})
	}
	return allResults
}

// Same categories/semantics as createMethodWhere in query.forOrganizationTable.handler.ts. 'internal'
// unions suggested-with-access and data-portal-added - both mean "not the public."
const matchesCreateMethod = (org: ForOrgTableRow, createMethod: 'public' | 'internal'): boolean => {
	switch (createMethod) {
		case 'public':
			return org.source?.source === 'suggestion' && org.creatorHadDpAccess === false
		case 'internal':
			return (
				(org.source?.source === 'suggestion' && org.creatorHadDpAccess === true) ||
				org.source?.source === 'data-portal'
			)
	}
}

// Matches statusWhere in query.forOrganizationTable.handler.ts.
const matchesStatus = (org: ForOrgTableRow, status: StatusFilterValue): boolean => {
	if (status === 'published') {
		return org.published
	}
	return !org.published && org.unpublishedReason === STATUS_FILTER_TO_REASON[status]
}

const filterFakeOrgs = (
	orgs: ForOrgTableRow[],
	status: StatusFilterValue[] | undefined,
	deleted: boolean | undefined,
	search: string | undefined,
	createMethod: 'public' | 'internal' | undefined
): ForOrgTableRow[] =>
	orgs.filter((org) => {
		// Multi-select - matching any one of the chosen values is enough (union/OR), same as the real handler.
		if (status && status.length > 0 && !status.some((s) => matchesStatus(org, s))) {
			return false
		}
		if (deleted !== undefined && org.deleted !== deleted) {
			return false
		}
		if (search && !org.name.toLowerCase().includes(search.toLowerCase())) {
			return false
		}
		if (createMethod && !matchesCreateMethod(org, createMethod)) {
			return false
		}
		return true
	})

const compareFakeOrgs = (
	a: ForOrgTableRow,
	b: ForOrgTableRow,
	id: ForOrgTableSortKey,
	desc: boolean
): number => {
	const av = a[id]
	const bv = b[id]
	if (av == null && bv == null) {
		return 0
	}
	if (av == null) {
		return desc ? -1 : 1
	}
	if (bv == null) {
		return desc ? 1 : -1
	}
	if (av < bv) {
		return desc ? 1 : -1
	}
	if (av > bv) {
		return desc ? -1 : 1
	}
	return 0
}

const sortFakeOrgs = (
	orgs: ForOrgTableRow[],
	sorting: { id: ForOrgTableSortKey; desc: boolean }[]
): ForOrgTableRow[] =>
	[...orgs].sort((a, b) => {
		for (const { id, desc } of sorting) {
			const result = compareFakeOrgs(a, b, id, desc)
			if (result !== 0) {
				return result
			}
		}
		return 0
	})

export const organization = {
	getIdFromSlug: getTRPCMock({
		path: ['organization', 'getIdFromSlug'],
		response: { id: 'orgn_MOCKED00000ID999999' },
	}),
	forOrganizationTable: getTRPCMock({
		path: ['organization', 'forOrganizationTable'],
		response: (input) => {
			const allResults = generateFakeOrgs(1000)
			const filtered = filterFakeOrgs(
				allResults,
				input.status,
				input.deleted,
				input.search,
				input.createMethod
			)
			const sorting = input.sorting?.length ? input.sorting : [{ id: 'name' as const, desc: false }]
			const sorted = sortFakeOrgs(filtered, sorting)

			const skip = input.skip ?? 0
			const take = input.take ?? 50
			const results = sorted.slice(skip, skip + take)
			return { results, total: filtered.length }
		},
	}),
	suggestionOptions: getTRPCMock({
		path: ['organization', 'suggestionOptions'],
		response: async () => {
			const { default: data } = await import('./json/organization.suggestionOptions.json')
			return data
		},
	}),
	createNewSuggestion: getTRPCMock({
		path: ['organization', 'createNewSuggestion'],
		type: 'mutation',
		response: { id: 'sugg_LKSDJFIOW156AWER15', slug: 'mock-suggested-org' },
	}),
	// Always rejects, to demo the "duplicate website" error the form shows when the server-side check fires
	// (e.g. a race condition, or the client-side domain check was bypassed).
	createNewSuggestionConflict: getTRPCMock({
		path: ['organization', 'createNewSuggestion'],
		type: 'mutation',
		error: {
			code: 'CONFLICT',
			message: 'This website is already associated with an existing organization in our system.',
		},
	}),
	// Same shape as createNewSuggestion - the Data Portal's Add Org modal (SuggestOrg variant="dataPortal")
	// calls this instead, tagging the created org with a different Source.
	createOrgFromDataPortal: getTRPCMock({
		path: ['organization', 'createOrgFromDataPortal'],
		type: 'mutation',
		response: { id: 'orgn_MOCKEDDATAPORTAL001', slug: 'mock-data-portal-org' },
	}),
	// Data Portal equivalent of createNewSuggestionConflict - demos the submit-error alert's "open in a new
	// tab to edit instead" link, which only renders in dataPortal mode.
	createOrgFromDataPortalConflict: getTRPCMock({
		path: ['organization', 'createOrgFromDataPortal'],
		type: 'mutation',
		error: {
			code: 'CONFLICT',
			message: 'This website is already associated with an existing organization in our system.',
		},
	}),
	// Flags "Existing Organization" as a name match (soft warning, non-blocking), any website containing
	// "example.org" as a domain match (hard block), and either "existingorg2.org" (edit-distance typo) or
	// "existingorg.com" / "existingorg.net" (same name, wrong-but-valid TLD) as a near-miss of that same
	// org's domain (dismissable checkbox) - used to demo the SuggestOrg duplicate-detection UI. Note: near-
	// miss triggers must have a *valid* TLD, or TLD validation in the form schema rejects them outright
	// before the near-miss check ever gets a chance to run.
	getPotentialMatches: getTRPCMock({
		path: ['organization', 'getPotentialMatches'],
		response: (input): ApiOutput['organization']['getPotentialMatches'] => {
			const matches: ApiOutput['organization']['getPotentialMatches'] = []
			const name = input.name?.trim().toLowerCase() ?? ''
			const website = input.website?.trim().toLowerCase() ?? ''
			const isNearMissTypo = matchesDomain(website, 'existingorg2.org')
			const isNearMissWrongTld =
				matchesDomain(website, 'existingorg.com') || matchesDomain(website, 'existingorg.net')

			if (name.includes('existing organization')) {
				matches.push({
					id: 'orgn_MOCKEDNAMEMATCH00001',
					name: 'Existing Organization',
					slug: 'existing-org',
					city: 'Springfield',
					state: 'IL',
					deleted: false,
					published: true,
					websiteMatch: false,
					websiteNearMatch: isNearMissTypo || isNearMissWrongTld ? 'existingorg.org' : null,
				})
			}

			if (matchesDomain(website, 'example.org')) {
				matches.push({
					id: 'orgn_MOCKEDSITEMATCH00001',
					name: 'A Totally Different Org',
					slug: 'a-totally-different-org',
					city: 'Denver',
					state: 'CO',
					deleted: false,
					published: true,
					websiteMatch: true,
					websiteNearMatch: null,
				})
			}

			return matches
		},
	}),
	generateSlug: getTRPCMock({
		path: ['organization', 'generateSlug'],
		response: 'this-is-a-generated-slug',
	}),
	checkForExisting: getTRPCMock({
		path: ['organization', 'checkForExisting'],
		response: (input) => existingOrg(input),
	}),
	searchName: getTRPCMock({
		path: ['organization', 'searchName'],
		response: async (input) => {
			const { default: data } = await import('./json/organization.searchName.json')
			const searchRegex = new RegExp(`.*${input.search}.*`, 'i')
			// The fixture has no similarity score (unlike the real pg_trgm-backed handler) - mocked
			// consumers don't sort or filter by it, so a constant placeholder satisfies the response shape.
			const results = data
				.filter(({ label }) => searchRegex.test(label))
				.map((result) => ({ ...result, score: 1 }))
			return results
		},
	}),
	getIntlCrisis: getTRPCMock({
		path: ['organization', 'getIntlCrisis'],
		response: async () => {
			const { default: data } = await import('./json/organization.getIntlCrisis.json')
			return data
		},
	}),
	getNatlCrisis: getTRPCMock({
		path: ['organization', 'getNatlCrisis'],
		response: async () => {
			const { default: data } = await import('./json/organization.getNatlCrisis.json')
			return data
		},
	}),
	searchDistance: getTRPCMock({
		path: ['organization', 'searchDistance'],
		response: async () => {
			const { default: data } = await import('./json/organization.searchDistance.json')
			const typedData: ApiOutput['organization']['searchDistance'] = {
				...data,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				orgs: data.orgs.map((org: any) => ({
					...org,
					addressVisibility: org.addressVisibility ?? 'FULL',
				})),
			}
			return typedData
		},
	}),
	searchDistanceLongTitle: getTRPCMock({
		path: ['organization', 'searchDistance'],
		response: async () => {
			const { default: data } = await import('./json/organization.searchDistanceLongTitle.json')
			const typedData: ApiOutput['organization']['searchDistance'] = {
				...data,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				orgs: data.orgs.map((org: any) => ({
					...org,
					addressVisibility: org.addressVisibility ?? 'FULL',
				})),
			}
			return typedData
		},
	}),
	forBadgeEditModal: getTRPCMock({
		path: ['organization', 'forBadgeEditModal'],
		response: async (input) => {
			return input.badgeType === 'organization-leadership'
				? ['attr_01GW2HHFVNPKMHYK12DDRVC1VJ']
				: [
						'attr_01GW2HHFVPCVX8F3B7M30ZJEHW',
						'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
						'attr_01GW2HHFVPTK9555WHJHDBDA2J',
						'attr_01GW2HHFVQ7SYGD3KM8WP9X50B',
						'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F',
						'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
						'attr_01GW2HHFVRMQFJ9AMA633SQQGV',
					]
		},
	}),
	updateAttributesBasic: getTRPCMock({
		path: ['organization', 'updateAttributesBasic'],
		type: 'mutation',
		response: (input) => ({
			added: input.createdVals?.length ?? 0,
			removed: input.deletedVals?.length ?? 0,
		}),
	}),
	attachAttribute: getTRPCMock({
		path: ['organization', 'attachAttribute'],
		type: 'mutation',
		response: () => ({
			id: 'atts_NEW0ID',
		}),
	}),
} satisfies MockHandlerObject<'organization'> & {
	searchDistanceLongTitle: HttpHandler
	createNewSuggestionConflict: HttpHandler
	createOrgFromDataPortalConflict: HttpHandler
}
