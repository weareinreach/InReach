import dotenv from 'dotenv'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import path from 'node:path'

// Runs the four contact-info edit-list queries against the real local Postgres (same setup as
// orgEmail/query.forContactInfo.realdb.test.ts). `.env` isn't loaded by Vitest by default.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const { prisma, generateId } = await import('@weareinreach/db')
const { default: phonesEdit } = await import('./orgPhone/query.forContactInfoEdit.handler')
const { default: emailsEdit } = await import('./orgEmail/query.forContactInfoEdit.handler')
const { default: websitesEdit } = await import('./orgWebsite/query.forContactInfoEdit.handler')
const { default: socialEdit } = await import('./orgSocialMedia/query.forContactInfoEdits.handler')

/**
 * Staff need to know where each contact item comes from, so each item is edited where it belongs:
 *
 * - The organization's edit page lists only the organization's own items - never location-only ones, even
 *   though phones, websites and social media added from a location are also stored under the organization.
 * - A location's edit page lists everything linked to it, and flags (`linkedFromOrg`) the organization's items
 *   linked there - those are changed on the organization's page.
 */
type ContactType = 'phone' | 'email' | 'website' | 'socialMedia'

let orgId: string
let locationA: string
const ids: Record<ContactType, { orgItem: string; locationItem: string }> = {
	phone: { orgItem: '', locationItem: '' },
	email: { orgItem: '', locationItem: '' },
	website: { orgItem: '', locationItem: '' },
	socialMedia: { orgItem: '', locationItem: '' },
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
	await prisma.organization.create({
		data: {
			id: orgId,
			name: 'Edit list test org',
			slug: `test-org-${orgId.slice(-10).toLowerCase()}`,
			sourceId: source.id,
			published: true,
			locations: {
				create: [
					{ id: locationA, city: 'A', countryId: country.id, published: true },
					{ id: generateId('orgLocation'), city: 'B', countryId: country.id, published: true },
				],
			},
		},
	})
	const onLocationA = { locations: { create: { orgLocationId: locationA } } }

	// Each type: the organization's item, linked to Location A; and Location A's own item (added from the
	// location - stored under the org too, except for emails).
	for (const [key, locationOnly] of [
		['orgItem', false],
		['locationItem', true],
	] as const) {
		ids.phone[key] = generateId('orgPhone')
		await prisma.orgPhone.create({
			data: {
				id: ids.phone[key],
				number: locationOnly ? '5555550201' : '5555550200',
				locationOnly,
				countryId: country.id,
				organization: { create: { organizationId: orgId } },
				...onLocationA,
			},
		})
		ids.email[key] = generateId('orgEmail')
		await prisma.orgEmail.create({
			data: {
				id: ids.email[key],
				email: `${key}@example.org`,
				locationOnly,
				...(locationOnly ? {} : { organization: { create: { organizationId: orgId } } }),
				...onLocationA,
			},
		})
		ids.website[key] = generateId('orgWebsite')
		await prisma.orgWebsite.create({
			data: {
				id: ids.website[key],
				url: `https://${key.toLowerCase()}.example.org`,
				orgLocationOnly: locationOnly,
				organizationId: orgId,
				...onLocationA,
			},
		})
		ids.socialMedia[key] = generateId('orgSocialMedia')
		await prisma.orgSocialMedia.create({
			data: {
				id: ids.socialMedia[key],
				username: key,
				url: `https://social.example.org/${key}`,
				serviceId: socialService.id,
				orgLocationOnly: locationOnly,
				organizationId: orgId,
				...onLocationA,
			},
		})
	}
})

afterAll(async () => {
	await prisma.orgPhone.deleteMany({ where: { id: { in: Object.values(ids.phone) } } })
	await prisma.orgEmail.deleteMany({ where: { id: { in: Object.values(ids.email) } } })
	// Websites/social media, locations and link rows cascade-delete with the organization.
	await prisma.organization.deleteMany({ where: { id: orgId } })
})

const editList = async (type: ContactType, parentId: string) => {
	const handler = { phone: phonesEdit, email: emailsEdit, website: websitesEdit, socialMedia: socialEdit }[
		type
	]
	const rows = (await handler({ input: { parentId } } as never)) as { id: string; linkedFromOrg: boolean }[]
	return rows.map(({ id, linkedFromOrg }) => ({ id, linkedFromOrg })).sort((a, b) => a.id.localeCompare(b.id))
}

describe.each(['phone', 'email', 'website', 'socialMedia'] as const)('%s edit lists', (type) => {
	it("the organization's edit page lists only the organization's own item", async () => {
		expect(await editList(type, orgId)).toEqual([{ id: ids[type].orgItem, linkedFromOrg: false }])
	})

	it("a location's edit page lists both, flagging the organization's item as linked from the org", async () => {
		expect(await editList(type, locationA)).toEqual(
			[
				{ id: ids[type].orgItem, linkedFromOrg: true },
				{ id: ids[type].locationItem, linkedFromOrg: false },
			].sort((a, b) => a.id.localeCompare(b.id))
		)
	})
})
