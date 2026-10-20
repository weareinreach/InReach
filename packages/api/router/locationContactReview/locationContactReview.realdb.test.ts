import { TRPCError } from '@trpc/server'
import dotenv from 'dotenv'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import path from 'node:path'

// Runs the review-list procedures against the real local Postgres (same setup as
// orgEmail/query.forContactInfo.realdb.test.ts). `.env` isn't loaded by Vitest by default.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

const { prisma, generateId } = await import('@weareinreach/db')
const { CLEANUP_NOTE } = await import('@weareinreach/db/lib/locationContactCleanup')
const { t } = await import('~api/lib/initTRPC')
const { locationContactReviewRouter } = await import('./index')
const { default: phonesForContactInfo } = await import('../orgPhone/query.forContactInfo.handler')

/**
 * The data managers' review list for the location-contact cleanup: one row per item carrying the migration's
 * "Needs review" note, until a Manager+ decides it - which sets the item's location-only flag, records the
 * decision (and who made it) as a note, and takes it off the list.
 */
let orgId: string
let locationA: string
let actorId: string
const ids = {
	phone: '',
	phoneOrgOnly: '',
	email: '',
	website: '',
	social: '',
	notFlagged: '',
	/** Never decided by any test - keeps a row on the list for the organization to the end. */
	undecided: '',
}
const emailIds: string[] = []
const phoneIds: string[] = []

const callerAs = (permissions: string[]) =>
	t.createCallerFactory(locationContactReviewRouter)({
		session: { user: { id: actorId, email: 'staff@example.org', permissions, roles: [] } },
	} as never)
const manager = () => callerAs(['dataPortalManager'])

beforeAll(async () => {
	const country = await prisma.country.findFirst({ where: { cca2: 'US' }, select: { id: true } })
	const source = await prisma.source.findFirst({ select: { id: true } })
	const user = await prisma.user.findFirst({ select: { id: true } })
	const socialService = await prisma.socialMediaService.findFirst({ select: { id: true } })
	if (!country || !source || !user || !socialService) {
		throw new Error('Fixture setup requires a seeded US Country, Source, User and SocialMediaService')
	}
	actorId = user.id

	orgId = generateId('organization')
	locationA = generateId('orgLocation')
	await prisma.organization.create({
		data: {
			id: orgId,
			name: 'AAA review list test org',
			slug: `test-org-${orgId.slice(-10).toLowerCase()}`,
			sourceId: source.id,
			published: true,
			locations: {
				create: [
					{ id: locationA, name: 'Location A', city: 'A', countryId: country.id, published: true },
					{ id: generateId('orgLocation'), city: 'B', countryId: country.id, published: true },
				],
			},
		},
	})
	const onLocationA = { locations: { create: { orgLocationId: locationA } } }
	const needsReviewNote = { internalNotes: { create: { text: CLEANUP_NOTE.needsReview } } }

	ids.phone = generateId('orgPhone')
	phoneIds.push(ids.phone)
	await prisma.orgPhone.create({
		data: {
			id: ids.phone,
			number: '5555550100',
			locationOnly: true,
			countryId: country.id,
			organization: { create: { organizationId: orgId } },
			...onLocationA,
			...needsReviewNote,
		},
	})
	ids.phoneOrgOnly = generateId('orgPhone')
	phoneIds.push(ids.phoneOrgOnly)
	await prisma.orgPhone.create({
		data: {
			id: ids.phoneOrgOnly,
			number: '5555550111',
			locationOnly: true,
			countryId: country.id,
			organization: { create: { organizationId: orgId } },
			...onLocationA,
			...needsReviewNote,
		},
	})
	ids.notFlagged = generateId('orgPhone')
	phoneIds.push(ids.notFlagged)
	await prisma.orgPhone.create({
		data: {
			id: ids.notFlagged,
			number: '5555550199',
			// A location's own number, already marked - so the org's main page has no phone.
			locationOnly: true,
			countryId: country.id,
			organization: { create: { organizationId: orgId } },
			...onLocationA,
		},
	})
	ids.email = generateId('orgEmail')
	emailIds.push(ids.email)
	await prisma.orgEmail.create({
		data: {
			id: ids.email,
			email: 'review@example.org',
			organization: { create: { organizationId: orgId } },
			...onLocationA,
			...needsReviewNote,
		},
	})
	ids.website = generateId('orgWebsite')
	await prisma.orgWebsite.create({
		data: {
			id: ids.website,
			url: 'https://review.example.org',
			organizationId: orgId,
			...onLocationA,
			...needsReviewNote,
		},
	})
	ids.undecided = generateId('orgWebsite')
	await prisma.orgWebsite.create({
		data: {
			id: ids.undecided,
			url: 'https://undecided.example.org',
			organizationId: orgId,
			...onLocationA,
			...needsReviewNote,
		},
	})
	ids.social = generateId('orgSocialMedia')
	await prisma.orgSocialMedia.create({
		data: {
			id: ids.social,
			username: 'review',
			url: 'https://social.example.org/review',
			serviceId: socialService.id,
			organizationId: orgId,
			...onLocationA,
			...needsReviewNote,
		},
	})
})

afterAll(async () => {
	const all = [...phoneIds, ...emailIds, ids.website, ids.social, ids.undecided]
	await prisma.internalNote.deleteMany({
		where: {
			OR: [
				{ orgPhoneId: { in: all } },
				{ orgEmailId: { in: all } },
				{ orgWebsiteId: { in: all } },
				{ orgSocialMediaId: { in: all } },
			],
		},
	})
	await prisma.orgPhone.deleteMany({ where: { id: { in: phoneIds } } })
	await prisma.orgEmail.deleteMany({ where: { id: { in: emailIds } } })
	// Websites/social media, locations and link rows cascade-delete with the organization.
	await prisma.organization.deleteMany({ where: { id: orgId } })
})

const ourRows = async () => (await manager().list()).filter((row) => row.org.id === orgId)

describe('locationContactReview - real local Postgres', () => {
	it('lists each item carrying a "Needs review" note, with its org, linked locations and current setting', async () => {
		const rows = await ourRows()

		expect(rows.map(({ id }) => id).sort()).toEqual(
			[ids.phone, ids.phoneOrgOnly, ids.email, ids.website, ids.social, ids.undecided].sort()
		)
		expect(rows.find(({ id }) => id === ids.phone)).toEqual({
			type: 'phone',
			id: ids.phone,
			value: '5555550100',
			showOnOrgPage: false,
			org: expect.objectContaining({ id: orgId, locationCount: 2, mainPageHasPhone: false }),
			locations: [{ id: locationA, name: 'Location A' }],
			services: 0,
		})
		expect(rows.find(({ id }) => id === ids.email)?.showOnOrgPage).toBe(true)
	})

	it('"Whole organization" clears the location-only setting, records who decided, and drops the row', async () => {
		await manager().decide({ type: 'phone', id: ids.phone, choice: 'orgAndLocations' })

		const phone = await prisma.orgPhone.findUniqueOrThrow({
			where: { id: ids.phone },
			select: {
				locationOnly: true,
				locations: { select: { orgLocationId: true } },
				internalNotes: { select: { text: true, userId: true } },
			},
		})
		expect(phone.locationOnly).toBe(false)
		expect(phone.locations).toEqual([{ orgLocationId: locationA }])
		expect(phone.internalNotes).toContainEqual({
			text: CLEANUP_NOTE.reviewed('orgAndLocations'),
			userId: actorId,
		})
		expect((await ourRows()).map(({ id }) => id)).not.toContain(ids.phone)
	})

	it.each([
		['website', () => ids.website, () => prisma.orgWebsite.findUniqueOrThrow({ where: { id: ids.website } })],
		[
			'socialMedia',
			() => ids.social,
			() => prisma.orgSocialMedia.findUniqueOrThrow({ where: { id: ids.social } }),
		],
	] as const)(
		'"Only these locations" marks a %s location-only and drops the row',
		async (type, getId, load) => {
			await manager().decide({ type, id: getId(), choice: 'locationsOnly' })

			const row = await load()
			expect('locationOnly' in row ? row.locationOnly : row.orgLocationOnly).toBe(true)
			expect((await ourRows()).map(({ id }) => id)).not.toContain(getId())
		}
	)

	it('"Organization page only" takes an email off its locations, keeps it on the org, and drops the row', async () => {
		await manager().decide({ type: 'email', id: ids.email, choice: 'orgOnly' })

		const email = await prisma.orgEmail.findUniqueOrThrow({
			where: { id: ids.email },
			select: {
				locationOnly: true,
				locations: { select: { orgLocationId: true } },
				organization: { select: { organizationId: true } },
			},
		})
		expect(email).toEqual({ locationOnly: false, locations: [], organization: [{ organizationId: orgId }] })
		expect((await ourRows()).map(({ id }) => id)).not.toContain(ids.email)
	})

	it('"Organization page only" on a phone makes it show on the org page right away', async () => {
		const orgPagePhones = async () =>
			(await phonesForContactInfo({ input: { parentId: orgId } } as never)).map(({ id }) => id)
		// Hidden now: it's marked location-only (how the cleanup leaves an undecided phone).
		expect(await orgPagePhones()).not.toContain(ids.phoneOrgOnly)

		await manager().decide({ type: 'phone', id: ids.phoneOrgOnly, choice: 'orgOnly' })

		expect(await orgPagePhones()).toContain(ids.phoneOrgOnly)
		// The list's own "main page has no phone number" flag uses the same rule.
		expect((await ourRows()).find(({ id }) => id === ids.undecided)?.org.mainPageHasPhone).toBe(true)
	})

	it('leaves out items with no "Needs review" note', async () => {
		expect((await ourRows()).map(({ id }) => id)).not.toContain(ids.notFlagged)
	})

	it('Basic staff can neither see the list nor decide', async () => {
		const basic = callerAs(['dataPortalBasic'])

		await expect(basic.list()).rejects.toBeInstanceOf(TRPCError)
		await expect(
			basic.decide({ type: 'phone', id: ids.notFlagged, choice: 'orgAndLocations' })
		).rejects.toBeInstanceOf(TRPCError)
	})
})
