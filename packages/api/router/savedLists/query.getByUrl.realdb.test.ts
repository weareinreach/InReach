import dotenv from 'dotenv'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import path from 'node:path'

// Runs getByUrl/getById against the real local Postgres (same setup as
// organization/query.searchDistanceV3.realdb.test.ts) - the published filters are nested Prisma relation
// filters a mocked client can't check. `.env` isn't loaded by Vitest by default.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

const { prisma, generateId } = await import('@weareinreach/db')
const { default: getByUrl } = await import('./query.getByUrl.handler')
const { default: getById } = await import('./query.getById.handler')

/**
 * #2110 (step 1): the public share-link endpoint returned the whole list row - including the owner's internal
 * user id - and only bare join rows. It now returns the same renderable shape as the owner's view, minus
 * anything unpublished or deleted, since anyone with the link can see it.
 */
let ownerId: string
let listId: string
let publishedOrgId: string
let unpublishedOrgId: string
const slug = `testshare${Date.now().toString(36)}`.slice(0, 10)

beforeAll(async () => {
	const owner = await prisma.user.findFirst({ select: { id: true } })
	const source = await prisma.source.findFirst({ select: { id: true } })
	if (!owner || !source) {
		throw new Error('Fixture setup requires at least one seeded User and Source in the local DB')
	}
	ownerId = owner.id

	const createOrg = async (name: string, published: boolean) => {
		const id = generateId('organization')
		await prisma.organization.create({
			data: { id, name, slug: `test-org-${id.slice(-10).toLowerCase()}`, sourceId: source.id, published },
		})
		return id
	}
	publishedOrgId = await createOrg('Shared list test org (published)', true)
	unpublishedOrgId = await createOrg('Shared list test org (unpublished)', false)

	listId = generateId('userSavedList')
	await prisma.userSavedList.create({
		data: {
			id: listId,
			name: 'Shared list test',
			sharedLinkKey: slug,
			ownedById: ownerId,
			organizations: {
				create: [{ organizationId: publishedOrgId }, { organizationId: unpublishedOrgId }],
			},
		},
	})
})

afterAll(async () => {
	await prisma.userSavedList.deleteMany({ where: { id: listId } })
	await prisma.organization.deleteMany({ where: { id: { in: [publishedOrgId, unpublishedOrgId] } } })
})

describe('savedList.getByUrl (public share link) - real local Postgres', () => {
	it("never returns the owner's user id", async () => {
		const result = await getByUrl({ input: { slug } } as never)

		expect(result).not.toHaveProperty('ownedById')
		expect(JSON.stringify(result)).not.toContain(ownerId)
	})

	it('returns renderable organizations, leaving out ones that are no longer published', async () => {
		const result = await getByUrl({ input: { slug } } as never)

		expect(result.name).toBe('Shared list test')
		expect(result.organizations.map(({ id }) => id)).toEqual([publishedOrgId])
		expect(result.organizations[0]).toMatchObject({ name: 'Shared list test org (published)' })
		expect(result._count.organizations).toBe(1)
	})

	it("the owner's own view (getById) still shows everything they saved", async () => {
		const result = await getById({
			ctx: { session: { user: { id: ownerId } } },
			input: { id: listId },
		} as never)

		expect(result?.organizations.map(({ id }) => id).sort()).toEqual(
			[publishedOrgId, unpublishedOrgId].sort()
		)
	})
})
