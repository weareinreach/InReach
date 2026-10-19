import dotenv from 'dotenv'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import path from 'node:path'

// Runs orgWebsite.forContactInfo and orgSocialMedia.forContactInfo against the real local Postgres (same
// setup as query.searchDistanceV3.realdb.test.ts) - the rule under test is a Prisma `where` across two
// relations, which a mocked client can't meaningfully check. `.env` isn't loaded by Vitest by default.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

const { prisma, generateId } = await import('@weareinreach/db')
const { default: websitesForContactInfo } = await import('./query.forContactInfo.handler')
const { default: socialForContactInfo } = await import('../orgSocialMedia/query.forContactInfo.handler')

/**
 * #2101: location-specific contact details belong to that location only. They are created with the org
 * relation too (the website's Crowdin description needs it), so before this rule the organization's own page
 * listed them as well. The rule, for both websites and social media:
 *
 * - Org page: everything on the org except `orgLocationOnly` items
 * - Location page: everything linked to that location, location-only and org-wide alike
 * - Location page with `locationOnly: true`: only that location's location-only items
 *
 * An org-wide item that staff link to locations ("Link or create new...") stays on the org page. A
 * single-location org is the exception (same as orgPhone): its page shows its one location inline and no
 * separate location page is ever reached, so its page shows location-only items too.
 */
let orgId: string
let locationA: string
let locationB: string
let singleOrgId: string
const ids = {
	website: { locationOnly: '', orgWideLinked: '', orgOnly: '', singleOrgLocationOnly: '' },
	social: { locationOnly: '', orgWideLinked: '', orgOnly: '', singleOrgLocationOnly: '' },
}

beforeAll(async () => {
	const country = await prisma.country.findFirst({ where: { cca2: 'US' }, select: { id: true } })
	const source = await prisma.source.findFirst({ select: { id: true } })
	const socialService = await prisma.socialMediaService.findFirst({ select: { id: true } })
	if (!country || !source || !socialService) {
		throw new Error('Fixture setup requires a seeded US Country, a Source and a SocialMediaService')
	}

	orgId = generateId('organization')
	locationA = generateId('orgLocation')
	locationB = generateId('orgLocation')
	await prisma.organization.create({
		data: {
			id: orgId,
			name: 'Contact rule test org',
			slug: `test-org-${orgId.slice(-10).toLowerCase()}`,
			sourceId: source.id,
			published: true,
			locations: {
				create: [
					{ id: locationA, city: 'Location A', countryId: country.id, published: true },
					{ id: locationB, city: 'Location B', countryId: country.id, published: true },
				],
			},
		},
	})

	const websiteLinks = (locationIds: string[]) =>
		locationIds.length
			? { locations: { create: locationIds.map((orgLocationId) => ({ orgLocationId })) } }
			: {}
	const createWebsite = async (
		url: string,
		orgLocationOnly: boolean,
		locationIds: string[],
		onOrg = orgId
	) => {
		const id = generateId('orgWebsite')
		await prisma.orgWebsite.create({
			data: { id, url, orgLocationOnly, organizationId: onOrg, ...websiteLinks(locationIds) },
		})
		return id
	}
	ids.website.locationOnly = await createWebsite('https://location-a.example.org', true, [locationA])
	ids.website.orgWideLinked = await createWebsite('https://org-wide.example.org', false, [
		locationA,
		locationB,
	])
	ids.website.orgOnly = await createWebsite('https://org-only.example.org', false, [])

	const createSocial = async (
		username: string,
		orgLocationOnly: boolean,
		locationIds: string[],
		onOrg = orgId
	) => {
		const id = generateId('orgSocialMedia')
		await prisma.orgSocialMedia.create({
			data: {
				id,
				username,
				url: `https://social.example.org/${username}`,
				serviceId: socialService.id,
				orgLocationOnly,
				organizationId: onOrg,
				...websiteLinks(locationIds),
			},
		})
		return id
	}
	ids.social.locationOnly = await createSocial('location-a', true, [locationA])
	ids.social.orgWideLinked = await createSocial('org-wide', false, [locationA, locationB])
	ids.social.orgOnly = await createSocial('org-only', false, [])

	singleOrgId = generateId('organization')
	const soloLocation = generateId('orgLocation')
	await prisma.organization.create({
		data: {
			id: singleOrgId,
			name: 'Contact rule test org (single location)',
			slug: `test-org-${singleOrgId.slice(-10).toLowerCase()}`,
			sourceId: source.id,
			published: true,
			locations: { create: [{ id: soloLocation, city: 'Solo', countryId: country.id, published: true }] },
		},
	})
	ids.website.singleOrgLocationOnly = await createWebsite(
		'https://solo-location.example.org',
		true,
		[soloLocation],
		singleOrgId
	)
	ids.social.singleOrgLocationOnly = await createSocial('solo-location', true, [soloLocation], singleOrgId)
})

afterAll(async () => {
	// Websites/social media, locations and their link rows all cascade-delete with the organization.
	await prisma.organization.deleteMany({ where: { id: { in: [orgId, singleOrgId] } } })
})

const listIds = async (
	handler: typeof websitesForContactInfo | typeof socialForContactInfo,
	parentId: string,
	locationOnly?: boolean
) => {
	const rows = await handler({
		input: { parentId, ...(locationOnly === undefined ? {} : { locationOnly }) },
	} as never)
	return rows.map((row) => row.id).sort()
}

describe.each([
	['orgWebsite', () => websitesForContactInfo, () => ids.website],
	['orgSocialMedia', () => socialForContactInfo, () => ids.social],
] as const)(
	'%s.forContactInfo - location-only items stay on their location (#2101)',
	(_name, getHandler, getIds) => {
		it("the organization's page leaves out location-only items, but keeps org-wide items linked to locations", async () => {
			const { locationOnly, orgWideLinked, orgOnly } = getIds()
			const expected = [orgWideLinked, orgOnly].sort()

			// The UI sends `locationOnly: false` (the component default); a direct call may omit it.
			expect(await listIds(getHandler(), orgId, false)).toEqual(expected)
			expect(await listIds(getHandler(), orgId)).toEqual(expected)
			expect(await listIds(getHandler(), orgId)).not.toContain(locationOnly)
		})

		it("a location's page shows its own location-only items and the org-wide items linked to it", async () => {
			const { locationOnly, orgWideLinked } = getIds()

			expect(await listIds(getHandler(), locationA, false)).toEqual([locationOnly, orgWideLinked].sort())
			expect(await listIds(getHandler(), locationB, false)).toEqual([orgWideLinked])
		})

		it('a location page asked for only location-only items gets just those', async () => {
			const { locationOnly } = getIds()

			expect(await listIds(getHandler(), locationA, true)).toEqual([locationOnly])
		})

		it("a single-location org's page still shows its location's location-only items", async () => {
			expect(await listIds(getHandler(), singleOrgId, false)).toEqual([getIds().singleOrgLocationOnly])
		})
	}
)
