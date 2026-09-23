import dotenv from 'dotenv'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import path from 'node:path'

// This file runs the real query.searchDistanceV3.handler against the real local Postgres+PostGIS
// instance (docker/docker-compose.yml's `db` service) - not a mock. See
// docs/Testing/search-api-test-inventory.md §1 for why: the actual matching/ranking logic lives inside
// a raw $queryRaw SQL string, which mocking can't meaningfully verify. `.env`'s DATABASE_URL isn't
// loaded by default under Vitest (confirmed directly - without this, Prisma falls back to the OS user
// and fails auth), so it's loaded explicitly here before importing @weareinreach/db.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

const { prisma, generateId, createGeoFields } = await import('@weareinreach/db')
const { updateGeo } = await import('~api/lib/prismaRaw/updateGeo')
const { default: searchDistanceV3 } = await import('./query.searchDistanceV3.handler')

let usCountryId: string
let sourceId: string

const createdOrgIds: string[] = []

beforeAll(async () => {
	const country = await prisma.country.findFirst({ where: { cca2: 'US' }, select: { id: true } })
	if (!country) throw new Error('Fixture setup requires a seeded US Country row in the local DB')
	usCountryId = country.id

	const source = await prisma.source.findFirst({ select: { id: true } })
	if (!source) throw new Error('Fixture setup requires at least one seeded Source row in the local DB')
	sourceId = source.id
})

afterEach(async () => {
	// OrgLocation cascade-deletes with its parent Organization (schema: onDelete: Cascade).
	await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } })
	createdOrgIds.length = 0
})

/**
 * Creates a real, minimal, published Organization + OrgLocation at a controlled lat/lon, with the `geo`
 * PostGIS point populated the same way the real app does it (createGeoFields for lat/lon/WKT, then the
 * updateGeo raw-SQL step - Prisma can't write an `Unsupported("geometry")` column directly).
 * `serviceIds`/`attributeIds` are set directly on the Organization row, matching how searchOrgByRelevance
 * actually reads them (materialized array columns, not a join) - see query.searchDistanceV3.handler.ts's
 * `candidates` CTE.
 */
const createTestOrg = async (opts: {
	name: string
	lat: number
	lon: number
	serviceIds?: string[]
	attributeIds?: string[]
}) => {
	const orgId = generateId('organization')
	const slug = `test-org-${orgId.slice(-10).toLowerCase()}`

	await prisma.organization.create({
		data: {
			id: orgId,
			name: opts.name,
			slug,
			sourceId,
			published: true,
			deleted: false,
			serviceIds: opts.serviceIds ?? [],
			attributeIds: opts.attributeIds ?? [],
		},
	})
	createdOrgIds.push(orgId)

	const locationId = generateId('orgLocation')
	await prisma.orgLocation.create({
		data: {
			id: locationId,
			orgId,
			city: 'Test City',
			countryId: usCountryId,
			published: true,
			deleted: false,
			...createGeoFields({ latitude: opts.lat, longitude: opts.lon }),
		},
	})
	await updateGeo('orgLocation', locationId)

	return { orgId, locationId }
}

const baseInput = {
	unit: 'mi' as const,
	skip: 0,
	take: 25,
	version: 'v3' as const,
	focuses: [],
	sortBias: 'DISTANCE' as const,
}

describe('organization.searchDistance (v3) - real local Postgres+PostGIS', () => {
	it('1.1/1.6: a published org within the search radius is matched, with distance and NEIGHBORHOOD tier populated', async () => {
		// A remote, real-data-free point (see 1.10's comment on why) - the org is placed ~0.3mi from
		// the search origin, not exactly co-located (see the dedicated 1.6b case for exactly-zero
		// distance). Earlier iterations of this test used real NYC coordinates and intermittently found
		// no match at all - not a bug, but this shared local dev DB's real order density there: `take`
		// defaults to a page of 25, and enough real, closer/higher-relevance NYC orgs exist to push a
		// synthetic fixture off page 1 entirely. Isolated coordinates avoid that class of flake.
		const { orgId } = await createTestOrg({ name: 'Nearby Test Org', lat: -20.005, lon: -140.0 })

		const result = await searchDistanceV3({
			input: { ...baseInput, lat: -20.0, lon: -140.0, dist: 10 },
		} as never)

		const match = result.orgs.find((org) => org.id === orgId)
		expect(match).toBeDefined()
		expect(match?.tier).toBe('NEIGHBORHOOD')
		expect(match?.distance).toBeGreaterThan(0)
		expect(match?.distance).toBeLessThan(1)
		expect(match?.isLocal).toBe(true)
	})

	/**
	 * Correctly fails - a real bug, found directly by this real-DB test, not from reading code first.
	 * `query.searchDistanceV3.handler.ts`'s `formattedResults.map(...)` computes `distMeters: result.distance ?
	 * parseInt(result.distance) : null` - a classic falsy-zero bug. When an org's straight-line distance rounds
	 * to exactly 0 meters (the org is essentially at the search coordinates - a plausible real case, e.g.
	 * someone searching from an address that's also a listed org location), the raw SQL correctly computes
	 * `distance = 0`, but the JS ternary treats `0` as falsy and nulls it out. The result is an internally
	 * inconsistent API response: `isLocal: true` and `tier: 'NEIGHBORHOOD'` (both computed independently, in
	 * SQL, from the same real 0-distance value) alongside `distance: null` - the exact combination a
	 * national/remote result would have for `isLocal`/`tier`, but paired with `isLocal: true`, which a national
	 * result never has. A frontend reading `distance` to decide how to label a result (`"0 mi away"` vs a
	 * national/remote badge) would show the wrong thing for the single closest possible match a search can
	 * return.
	 */
	it('1.6b: an org at exactly zero distance from the search point loses its distance value entirely (should be 0, not null)', async () => {
		const { orgId } = await createTestOrg({ name: 'Exact Match Org', lat: -20.0, lon: -140.0 })

		const result = await searchDistanceV3({
			input: { ...baseInput, lat: -20.0, lon: -140.0, dist: 10 },
		} as never)

		const match = result.orgs.find((org) => org.id === orgId)
		expect(match?.distance).toBe(0)
	})

	it('an org far outside the search radius (and with no matching ServiceArea) is not matched', async () => {
		// Sydney, Australia - nowhere near a small-radius NYC search, and no ServiceArea fixture set up
		// for this test org, so it can't match via the national/remote path either.
		const { orgId } = await createTestOrg({ name: 'Far Away Test Org', lat: -33.8688, lon: 151.2093 })

		const result = await searchDistanceV3({
			input: { ...baseInput, lat: 40.7128, lon: -74.006, dist: 10 },
		} as never)

		expect(result.orgs.find((org) => org.id === orgId)).toBeUndefined()
	})

	it('1.3: services filter only returns orgs whose materialized serviceIds overlap the requested services (OR logic)', async () => {
		const { orgId: matchingOrg } = await createTestOrg({
			name: 'Service Match Org',
			lat: 40.7128,
			lon: -74.006,
			serviceIds: ['svtg_test_abortion_care'],
		})
		const { orgId: nonMatchingOrg } = await createTestOrg({
			name: 'Service Non-Match Org',
			lat: 40.7128,
			lon: -74.006,
			serviceIds: ['svtg_test_legal_aid'],
		})

		const result = await searchDistanceV3({
			input: { ...baseInput, lat: 40.7128, lon: -74.006, dist: 10, services: ['svtg_test_abortion_care'] },
		} as never)

		const ids = result.orgs.map((org) => org.id)
		expect(ids).toContain(matchingOrg)
		expect(ids).not.toContain(nonMatchingOrg)
	})

	it('1.4: attributes filter only returns orgs whose materialized attributeIds overlap the requested attributes', async () => {
		const { orgId: matchingOrg } = await createTestOrg({
			name: 'Attribute Match Org',
			lat: 40.7128,
			lon: -74.006,
			attributeIds: ['attr_test_free_service'],
		})
		const { orgId: nonMatchingOrg } = await createTestOrg({
			name: 'Attribute Non-Match Org',
			lat: 40.7128,
			lon: -74.006,
			attributeIds: ['attr_test_sliding_scale'],
		})

		const result = await searchDistanceV3({
			input: { ...baseInput, lat: 40.7128, lon: -74.006, dist: 10, attributes: ['attr_test_free_service'] },
		} as never)

		const ids = result.orgs.map((org) => org.id)
		expect(ids).toContain(matchingOrg)
		expect(ids).not.toContain(nonMatchingOrg)
	})

	it('1.10: skip/take paginate the real result set, with `total` reflecting the full matching count regardless of page size', async () => {
		// A remote open-ocean point (South Pacific, nowhere near any real org location) - this is the
		// shared local dev DB, not an isolated test DB (see docs/Testing/search-api-test-inventory.md's
		// Purpose section), so asserting an exact `resultCount` requires coordinates guaranteed to have
		// zero pre-existing real matches, not just "probably empty" ones like a real city.
		const lat = -20.0
		const lon = -140.0
		await createTestOrg({ name: 'Page Org 1', lat, lon })
		await createTestOrg({ name: 'Page Org 2', lat, lon })
		await createTestOrg({ name: 'Page Org 3', lat, lon })

		const page1 = await searchDistanceV3({
			input: { ...baseInput, lat, lon, dist: 10, take: 2, skip: 0 },
		} as never)
		const page2 = await searchDistanceV3({
			input: { ...baseInput, lat, lon, dist: 10, take: 2, skip: 2 },
		} as never)

		expect(page1.orgs).toHaveLength(2)
		expect(page1.resultCount).toBe(3)
		expect(page2.orgs).toHaveLength(1)
		expect(page2.resultCount).toBe(3)
		// No overlap between the two pages.
		const page1Ids = new Set(page1.orgs.map((org) => org.id))
		expect(page2.orgs.every((org) => !page1Ids.has(org.id))).toBe(true)
	})
})
