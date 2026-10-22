import dotenv from 'dotenv'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import path from 'node:path'

// Runs orgEmail.forContactInfo and orgEmail.update against the real local Postgres (same setup as
// orgWebsite/query.forContactInfo.realdb.test.ts) - the rule under test is a Prisma `where` across the email's
// org and location link tables, which a mocked client can't meaningfully check. `.env` isn't loaded by Vitest
// by default.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

const { prisma, generateId } = await import('@weareinreach/db')
const { default: forContactInfo } = await import('./query.forContactInfo.handler')
const { default: update } = await import('./mutation.update.handler')

/**
 * Location-only emails used to show nowhere: `forContactInfo` applied `locationOnly` as a plain filter on
 * every page, and the UI always sends `locationOnly: false`, so a location's own location-only emails were
 * dropped from that location's page too. Emails now follow the same rule as websites and social media
 * (#2101):
 *
 * - Org page: the org's emails except location-only ones
 * - Location page: everything linked to that location
 * - Single-location org page: everything, including emails added from its one location
 *
 * And an email added from a location's page is now marked location-only when it's created.
 */
let orgId: string
let locationA: string
let locationB: string
let singleOrgId: string
let soloLocation: string
let actorId: string
const emailIds: string[] = []
const ids = {
	orgOnly: '',
	orgWideLinked: '',
	/** Older shape: on the org and linked to a location, marked location-only. */
	orgLinkedLocationOnly: '',
	/** Current shape for an email added from a location: linked to the location only. */
	addedFromLocation: '',
	singleOrgOrgEmail: '',
	singleOrgAddedFromLocation: '',
}

beforeAll(async () => {
	const country = await prisma.country.findFirst({ where: { cca2: 'US' }, select: { id: true } })
	const source = await prisma.source.findFirst({ select: { id: true } })
	const user = await prisma.user.findFirst({ select: { id: true } })
	if (!country || !source || !user) {
		throw new Error('Fixture setup requires a seeded US Country, a Source and a User')
	}
	actorId = user.id

	const createOrg = async (name: string, locationIds: string[]) => {
		const id = generateId('organization')
		await prisma.organization.create({
			data: {
				id,
				name,
				slug: `test-org-${id.slice(-10).toLowerCase()}`,
				sourceId: source.id,
				published: true,
				locations: {
					create: locationIds.map((locId, i) => ({
						id: locId,
						city: `Location ${i + 1}`,
						countryId: country.id,
						published: true,
					})),
				},
			},
		})
		return id
	}
	locationA = generateId('orgLocation')
	locationB = generateId('orgLocation')
	orgId = await createOrg('Email rule test org', [locationA, locationB])
	soloLocation = generateId('orgLocation')
	singleOrgId = await createOrg('Email rule test org (single location)', [soloLocation])

	const createEmail = async (
		email: string,
		locationOnly: boolean,
		{ onOrg, locationIds }: { onOrg?: string; locationIds: string[] }
	) => {
		const id = generateId('orgEmail')
		await prisma.orgEmail.create({
			data: {
				id,
				email,
				locationOnly,
				...(onOrg ? { organization: { create: { organizationId: onOrg } } } : {}),
				...(locationIds.length
					? { locations: { create: locationIds.map((orgLocationId) => ({ orgLocationId })) } }
					: {}),
			},
		})
		emailIds.push(id)
		return id
	}
	ids.orgOnly = await createEmail('org-only@example.org', false, { onOrg: orgId, locationIds: [] })
	ids.orgWideLinked = await createEmail('org-wide@example.org', false, {
		onOrg: orgId,
		locationIds: [locationA, locationB],
	})
	ids.orgLinkedLocationOnly = await createEmail('legacy-location-a@example.org', true, {
		onOrg: orgId,
		locationIds: [locationA],
	})
	ids.addedFromLocation = await createEmail('location-a@example.org', true, { locationIds: [locationA] })
	ids.singleOrgOrgEmail = await createEmail('solo-org@example.org', false, {
		onOrg: singleOrgId,
		locationIds: [],
	})
	ids.singleOrgAddedFromLocation = await createEmail('solo-location@example.org', true, {
		locationIds: [soloLocation],
	})
})

afterAll(async () => {
	// Emails don't cascade-delete with the org (only their link rows do), so they're removed explicitly.
	await prisma.orgEmail.deleteMany({ where: { id: { in: emailIds } } })
	await prisma.organization.deleteMany({ where: { id: { in: [orgId, singleOrgId] } } })
})

const listIds = async (parentId: string, locationOnly?: boolean) => {
	const rows = await forContactInfo({
		// The UI always sends both flags (component defaults are `false`).
		input: { parentId, locationOnly: locationOnly ?? false, serviceOnly: false },
	} as never)
	return rows.map((row) => row.id).sort()
}

describe('orgEmail.forContactInfo - location-only emails stay on their location', () => {
	it("the organization's page leaves out location-only emails, but keeps org-wide emails linked to locations", async () => {
		expect(await listIds(orgId)).toEqual([ids.orgOnly, ids.orgWideLinked].sort())
	})

	it("a location's page shows its own location-only emails and the org-wide emails linked to it", async () => {
		expect(await listIds(locationA)).toEqual(
			[ids.orgWideLinked, ids.orgLinkedLocationOnly, ids.addedFromLocation].sort()
		)
		expect(await listIds(locationB)).toEqual([ids.orgWideLinked])
	})

	it('a location page asked for only location-only emails gets just those', async () => {
		expect(await listIds(locationA, true)).toEqual([ids.orgLinkedLocationOnly, ids.addedFromLocation].sort())
	})

	it("a single-location org's page shows its org emails and the emails added from its location", async () => {
		expect(await listIds(singleOrgId)).toEqual([ids.singleOrgOrgEmail, ids.singleOrgAddedFromLocation].sort())
	})
})

describe('orgEmail.update (create) - an email added from a location is marked location-only', () => {
	const create = async (email: string, linkLocationId: string | null) => {
		const id = generateId('orgEmail')
		emailIds.push(id)
		await update({
			ctx: { actorId },
			// The drawer always sends `locationOnly: false` for a new email.
			input: { id, orgId, email, locationOnly: false, serviceOnly: false, linkLocationId },
		} as never)
		return prisma.orgEmail.findUniqueOrThrow({
			where: { id },
			select: {
				locationOnly: true,
				organization: { select: { organizationId: true } },
				locations: { select: { orgLocationId: true } },
			},
		})
	}

	it("added from a location's page: location-only, linked to that location and not to the org", async () => {
		const created = await create('new-location-a@example.org', locationA)

		expect(created.locationOnly).toBe(true)
		expect(created.locations).toEqual([{ orgLocationId: locationA }])
		expect(created.organization).toEqual([])
		expect(await listIds(locationA)).toContain(emailIds.at(-1))
		expect(await listIds(orgId)).not.toContain(emailIds.at(-1))
	})

	it("added from the org's page: not location-only, linked to the org", async () => {
		const created = await create('new-org@example.org', null)

		expect(created.locationOnly).toBe(false)
		expect(created.organization).toEqual([{ organizationId: orgId }])
		expect(await listIds(orgId)).toContain(emailIds.at(-1))
	})
})
