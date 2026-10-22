import { generateId, getAuditedClient } from '@weareinreach/db'
import { CLEANUP_NOTE } from '@weareinreach/db/lib/locationContactCleanup'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDecideSchema } from './mutation.decide.schema'

type Tx = Parameters<Parameters<ReturnType<typeof getAuditedClient>['$transaction']>[0]>[0]

/**
 * The organization a review-list item belongs to, read from the locations it's linked to - or undefined when
 * it isn't linked to any (an item marked location-only with no location; it's already stored under its org).
 */
const findOrgId = async (tx: Tx, type: TDecideSchema['type'], id: string) => {
	const where = { location: { published: true, deleted: false } }
	const select = { location: { select: { orgId: true } } }
	const links =
		type === 'phone'
			? await tx.orgLocationPhone.findMany({ where: { phoneId: id, ...where }, select, take: 1 })
			: type === 'email'
				? await tx.orgLocationEmail.findMany({ where: { orgEmailId: id, ...where }, select, take: 1 })
				: type === 'website'
					? await tx.orgLocationWebsite.findMany({ where: { orgWebsiteId: id, ...where }, select, take: 1 })
					: await tx.orgLocationSocialMedia.findMany({
							where: { socialMediaId: id, ...where },
							select,
							take: 1,
						})
	return links[0]?.location.orgId
}

/**
 * "The organization's only": make sure it's attached to the organization (so its page shows it), then take it
 * off every location it's listed at. Every item on the review list is attached to the organization already;
 * attaching again is a no-op guard, not the expected path.
 */
const moveToOrgOnly = async (tx: Tx, type: TDecideSchema['type'], id: string, orgId: string) => {
	switch (type) {
		case 'phone': {
			await tx.organizationPhone.createMany({
				data: [{ phoneId: id, organizationId: orgId }],
				skipDuplicates: true,
			})
			await tx.orgLocationPhone.deleteMany({ where: { phoneId: id } })
			break
		}
		case 'email': {
			await tx.organizationEmail.createMany({
				data: [{ orgEmailId: id, organizationId: orgId }],
				skipDuplicates: true,
			})
			await tx.orgLocationEmail.deleteMany({ where: { orgEmailId: id } })
			break
		}
		case 'website': {
			await tx.orgWebsite.update({ where: { id }, data: { organizationId: orgId } })
			await tx.orgLocationWebsite.deleteMany({ where: { orgWebsiteId: id } })
			break
		}
		case 'socialMedia': {
			await tx.orgSocialMedia.update({ where: { id }, data: { organizationId: orgId } })
			await tx.orgLocationSocialMedia.deleteMany({ where: { socialMediaId: id } })
			break
		}
	}
}

const setLocationOnly = async (tx: Tx, type: TDecideSchema['type'], id: string, locationOnly: boolean) => {
	switch (type) {
		case 'phone': {
			await tx.orgPhone.update({ where: { id }, data: { locationOnly } })
			break
		}
		case 'email': {
			await tx.orgEmail.update({ where: { id }, data: { locationOnly } })
			break
		}
		case 'website': {
			await tx.orgWebsite.update({ where: { id }, data: { orgLocationOnly: locationOnly } })
			break
		}
		case 'socialMedia': {
			await tx.orgSocialMedia.update({ where: { id }, data: { orgLocationOnly: locationOnly } })
			break
		}
	}
}

const noteLink = (type: TDecideSchema['type'], id: string) =>
	({
		phone: { orgPhoneId: id },
		email: { orgEmailId: id },
		website: { orgWebsiteId: id },
		socialMedia: { orgSocialMediaId: id },
	})[type]

/**
 * A data manager's answer for one review-list item. Sets where it shows, and records the answer (and who gave
 * it) as an internal note - which also takes it off the list.
 */
const decide = async ({ ctx, input }: TRPCHandlerParams<TDecideSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { type, id, choice } = input

	await prisma.$transaction(async (tx) => {
		if (choice === 'orgOnly') {
			const orgId = await findOrgId(tx, type, id)
			if (orgId) {
				await moveToOrgOnly(tx, type, id, orgId)
			}
		}
		await setLocationOnly(tx, type, id, choice === 'locationsOnly')
		await tx.internalNote.create({
			data: {
				id: generateId('internalNote'),
				text: CLEANUP_NOTE.reviewed(choice),
				userId: ctx.actorId,
				...noteLink(type, id),
			},
		})
	})

	return { type, id, choice }
}
export default decide
