import dotenv from 'dotenv'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import path from 'node:path'

// Runs the phone/email/website saves against the real local Postgres (same setup as
// orgEmail/query.forContactInfo.realdb.test.ts). `.env` isn't loaded by Vitest by default.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const { prisma, generateId, generateNestedFreeText } = await import('@weareinreach/db')
const { default: phoneUpsert } = await import('./orgPhone/mutation.upsert.handler')
const { default: emailUpdate } = await import('./orgEmail/mutation.update.handler')
const { default: websiteUpsert } = await import('./orgWebsite/mutation.upsert.handler')

/**
 * Clearing a contact item's description in its drawer used to look saved, then come back on refresh: the
 * saves only ever wrote a non-empty description and skipped an empty one, leaving the old text in place. An
 * empty description now removes it; leaving the description out of a save still keeps it.
 */
let orgId: string
let actorId: string
let countryId: string
const created = { phones: [] as string[], emails: [] as string[] }

beforeAll(async () => {
	const country = await prisma.country.findFirst({ where: { cca2: 'US' }, select: { id: true } })
	const source = await prisma.source.findFirst({ select: { id: true } })
	const user = await prisma.user.findFirst({ select: { id: true } })
	if (!country || !source || !user) {
		throw new Error('Fixture setup requires a seeded US Country, a Source and a User')
	}
	actorId = user.id
	countryId = country.id
	orgId = generateId('organization')
	await prisma.organization.create({
		data: {
			id: orgId,
			name: 'Description clear test org',
			slug: `test-org-${orgId.slice(-10).toLowerCase()}`,
			sourceId: source.id,
			published: true,
		},
	})
})

afterAll(async () => {
	await prisma.orgPhone.deleteMany({ where: { id: { in: created.phones } } })
	await prisma.orgEmail.deleteMany({ where: { id: { in: created.emails } } })
	// Websites cascade-delete with the organization.
	await prisma.organization.deleteMany({ where: { id: orgId } })
})

const createPhone = async () => {
	const id = generateId('orgPhone')
	await prisma.orgPhone.create({
		data: {
			id,
			number: '5555550300',
			country: { connect: { id: countryId } },
			organization: { create: { organizationId: orgId } },
			description: generateNestedFreeText({ orgId, itemId: id, text: 'Front desk', type: 'phoneDesc' }),
		},
	})
	created.phones.push(id)
	return id
}
const createEmail = async () => {
	const id = generateId('orgEmail')
	await prisma.orgEmail.create({
		data: {
			id,
			email: `${id.slice(-6).toLowerCase()}@example.org`,
			organization: { create: { organizationId: orgId } },
			description: generateNestedFreeText({ orgId, itemId: id, text: 'Front desk', type: 'emailDesc' }),
		},
	})
	created.emails.push(id)
	return id
}
const createWebsite = async () => {
	const id = generateId('orgWebsite')
	await prisma.orgWebsite.create({
		data: {
			id,
			url: 'https://desc.example.org',
			organization: { connect: { id: orgId } },
			description: generateNestedFreeText({ orgId, itemId: id, text: 'Front desk', type: 'websiteDesc' }),
		},
	})
	return id
}

const save = {
	phone: (id: string, description?: string | null) =>
		phoneUpsert({
			ctx: { actorId },
			input: {
				operation: 'update',
				id,
				orgId,
				...(description === undefined ? {} : { description }),
			},
		} as never),
	email: (id: string, description?: string | null) =>
		emailUpdate({
			ctx: { actorId },
			input: { id, orgId, ...(description === undefined ? {} : { description }) },
		} as never),
	website: (id: string, description?: string | null) =>
		websiteUpsert({
			ctx: { actorId },
			input: {
				operation: 'update',
				id,
				organizationId: orgId,
				...(description === undefined ? {} : { description }),
			},
		} as never),
}
const descriptionOf = async (type: keyof typeof save, id: string) => {
	const select = { descriptionId: true } as const
	const row =
		type === 'phone'
			? await prisma.orgPhone.findUnique({ where: { id }, select })
			: type === 'email'
				? await prisma.orgEmail.findUnique({ where: { id }, select })
				: await prisma.orgWebsite.findUnique({ where: { id }, select })
	return row?.descriptionId ?? null
}
const create = { phone: createPhone, email: createEmail, website: createWebsite }

describe.each(['phone', 'email', 'website'] as const)('%s description', (type) => {
	it.each([[''], [null]] as const)('saving it as %j removes it', async (cleared) => {
		const id = await create[type]()
		expect(await descriptionOf(type, id)).not.toBeNull()

		await save[type](id, cleared)

		expect(await descriptionOf(type, id)).toBeNull()
	})

	it('leaving it out of a save keeps it', async () => {
		const id = await create[type]()

		await save[type](id)

		expect(await descriptionOf(type, id)).not.toBeNull()
	})

	it('clearing one that was never set is a no-op, not an error', async () => {
		const id = await create[type]()
		await save[type](id, '')

		await expect(save[type](id, '')).resolves.toBeDefined()
		expect(await descriptionOf(type, id)).toBeNull()
	})
})
