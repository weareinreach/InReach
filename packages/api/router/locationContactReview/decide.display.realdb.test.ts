import dotenv from 'dotenv'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import path from 'node:path'

// Runs against the real local Postgres (same setup as locationContactReview.realdb.test.ts). `.env` isn't
// loaded by Vitest by default.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

const { prisma, generateId } = await import('@weareinreach/db')
const { CLEANUP_NOTE } = await import('@weareinreach/db/lib/locationContactCleanup')
const { t } = await import('~api/lib/initTRPC')
const { locationContactReviewRouter } = await import('./index')
const { default: phonesForContactInfo } = await import('../orgPhone/query.forContactInfo.handler')
const { default: emailsForContactInfo } = await import('../orgEmail/query.forContactInfo.handler')
const { default: websitesForContactInfo } = await import('../orgWebsite/query.forContactInfo.handler')
const { default: socialForContactInfo } = await import('../orgSocialMedia/query.forContactInfo.handler')

/**
 * Every Contact Cleanup decision, for every contact type, checked end to end: make the decision on a fresh
 * review-list item, then ask the same API the organization's main page and the location's page use what they
 * display. One item per type × choice, each attached (as the review list's items are) to the organization and
 * to one of its two locations.
 */
type ContactType = 'phone' | 'email' | 'website' | 'socialMedia'
type Choice = 'orgOnly' | 'orgAndLocations' | 'locationsOnly'

const EXPECTED: Record<Choice, { orgPage: boolean; locationPage: boolean }> = {
	orgOnly: { orgPage: true, locationPage: false },
	orgAndLocations: { orgPage: true, locationPage: true },
	locationsOnly: { orgPage: false, locationPage: true },
}

let orgId: string
let locationA: string
let actorId: string
let countryId: string
let socialServiceId: string
const created: { type: ContactType; id: string }[] = []

beforeAll(async () => {
	const country = await prisma.country.findFirst({ where: { cca2: 'US' }, select: { id: true } })
	const source = await prisma.source.findFirst({ select: { id: true } })
	const user = await prisma.user.findFirst({ select: { id: true } })
	const socialService = await prisma.socialMediaService.findFirst({ select: { id: true } })
	if (!country || !source || !user || !socialService) {
		throw new Error('Fixture setup requires a seeded US Country, Source, User and SocialMediaService')
	}
	actorId = user.id
	countryId = country.id
	socialServiceId = socialService.id

	orgId = generateId('organization')
	locationA = generateId('orgLocation')
	await prisma.organization.create({
		data: {
			id: orgId,
			name: 'Contact Cleanup display test org',
			slug: `test-org-${orgId.slice(-10).toLowerCase()}`,
			sourceId: source.id,
			published: true,
			locations: {
				create: [
					{ id: locationA, name: 'Location A', city: 'A', countryId, published: true },
					{ id: generateId('orgLocation'), name: 'Location B', city: 'B', countryId, published: true },
				],
			},
		},
	})
})

afterAll(async () => {
	const idsOf = (type: ContactType) => created.filter((item) => item.type === type).map(({ id }) => id)
	await prisma.internalNote.deleteMany({
		where: {
			OR: [
				{ orgPhoneId: { in: idsOf('phone') } },
				{ orgEmailId: { in: idsOf('email') } },
				{ orgWebsiteId: { in: idsOf('website') } },
				{ orgSocialMediaId: { in: idsOf('socialMedia') } },
			],
		},
	})
	await prisma.orgPhone.deleteMany({ where: { id: { in: idsOf('phone') } } })
	await prisma.orgEmail.deleteMany({ where: { id: { in: idsOf('email') } } })
	// Websites/social media, locations and link rows cascade-delete with the organization.
	await prisma.organization.deleteMany({ where: { id: orgId } })
})

/**
 * A review-list item as the cleanup migration leaves it: attached to the organization and to Location A, with
 * the "Needs review" note. Undecided phones were marked location-only (keeping the org page as it was); the
 * other types were left as they were.
 */
const createReviewItem = async (type: ContactType) => {
	const onLocationA = { locations: { create: { orgLocationId: locationA } } }
	const needsReview = { internalNotes: { create: { text: CLEANUP_NOTE.needsReview } } }
	const suffix = Math.random().toString(36).slice(2, 8)
	let id: string
	switch (type) {
		case 'phone': {
			id = generateId('orgPhone')
			await prisma.orgPhone.create({
				data: {
					id,
					number: `555${suffix.replace(/\D/g, '0').padEnd(7, '0').slice(0, 7)}`,
					locationOnly: true,
					countryId,
					organization: { create: { organizationId: orgId } },
					...onLocationA,
					...needsReview,
				},
			})
			break
		}
		case 'email': {
			id = generateId('orgEmail')
			await prisma.orgEmail.create({
				data: {
					id,
					email: `${suffix}@example.org`,
					organization: { create: { organizationId: orgId } },
					...onLocationA,
					...needsReview,
				},
			})
			break
		}
		case 'website': {
			id = generateId('orgWebsite')
			await prisma.orgWebsite.create({
				data: {
					id,
					url: `https://${suffix}.example.org`,
					organizationId: orgId,
					...onLocationA,
					...needsReview,
				},
			})
			break
		}
		case 'socialMedia': {
			id = generateId('orgSocialMedia')
			await prisma.orgSocialMedia.create({
				data: {
					id,
					username: suffix,
					url: `https://social.example.org/${suffix}`,
					serviceId: socialServiceId,
					organizationId: orgId,
					...onLocationA,
					...needsReview,
				},
			})
			break
		}
	}
	created.push({ type, id })
	return id
}

/** What a page displays, asked exactly the way its contact list asks (ContactInfo/*.tsx's defaults). */
const displayedOn = async (type: ContactType, parentId: string) => {
	const call = (handler: (opts: never) => Promise<{ id: string }[]>, input: object) =>
		handler({ input: { parentId, ...input } } as never)
	const rows = await {
		phone: () => call(phonesForContactInfo as never, {}),
		email: () => call(emailsForContactInfo as never, { locationOnly: false, serviceOnly: false }),
		website: () => call(websitesForContactInfo as never, { locationOnly: false }),
		socialMedia: () => call(socialForContactInfo as never, {}),
	}[type]()
	return rows.map(({ id }) => id)
}

const manager = () =>
	t.createCallerFactory(locationContactReviewRouter)({
		session: {
			user: { id: actorId, email: 'staff@example.org', permissions: ['dataPortalManager'], roles: [] },
		},
	} as never)

const CASES = (['phone', 'email', 'website', 'socialMedia'] as const).flatMap((type) =>
	(['orgOnly', 'orgAndLocations', 'locationsOnly'] as const).map((choice) => [type, choice] as const)
)

describe('Contact Cleanup decisions - what the organization page and location page display afterwards', () => {
	it.each(CASES)('%s, "%s"', async (type, choice) => {
		const id = await createReviewItem(type)

		await manager().decide({ type, id, choice })

		expect({
			orgPage: (await displayedOn(type, orgId)).includes(id),
			locationPage: (await displayedOn(type, locationA)).includes(id),
		}).toEqual(EXPECTED[choice])
		expect((await manager().list()).map((row) => row.id)).not.toContain(id)
	})
})

/**
 * An item marked location-only but linked to no location at all. The cleanup migration clears its mark (it
 * showed on the main page) and lists it for review; a person decides whether it stays on the main page.
 */
describe('Contact Cleanup - an item with no location', () => {
	const createUnlocatedPhone = async () => {
		const id = generateId('orgPhone')
		await prisma.orgPhone.create({
			data: {
				id,
				number: '5555550123',
				locationOnly: false,
				countryId,
				organization: { create: { organizationId: orgId } },
				internalNotes: { create: { text: CLEANUP_NOTE.needsReview } },
			},
		})
		created.push({ type: 'phone', id })
		return id
	}

	it('is listed under its own organization, with no locations', async () => {
		const id = await createUnlocatedPhone()

		const row = (await manager().list()).find((item) => item.id === id)
		expect(row).toMatchObject({ org: { id: orgId }, locations: [], services: 0, showOnOrgPage: true })

		await manager().decide({ type: 'phone', id, choice: 'orgOnly' })
	})

	it.each([
		['orgOnly', true],
		['locationsOnly', false],
	] as const)('"%s": shown on the main page = %s', async (choice, onOrgPage) => {
		const id = await createUnlocatedPhone()

		await manager().decide({ type: 'phone', id, choice })

		expect((await displayedOn('phone', orgId)).includes(id)).toBe(onOrgPage)
		expect((await manager().list()).map((row) => row.id)).not.toContain(id)
	})
})
