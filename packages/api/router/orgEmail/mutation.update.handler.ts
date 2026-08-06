import { buildContextUrl, upsertSingleKey } from '@weareinreach/crowdin/api'
import { generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const select = {
	id: true,
	deleted: true,
	description: { select: { tsKey: { select: { text: true, key: true, ns: true } } } },
	descriptionId: true,
	email: true,
	firstName: true,
	lastName: true,
	locationOnly: true,
	primary: true,
	published: true,
	serviceOnly: true,
	titleId: true,
} as const
const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { id, orgId, description, descriptionId, titleId, email, linkLocationId, ...record } = input

	const updateDescriptionText = description
		? generateNestedFreeTextUpsert({
				orgId,
				type: 'emailDesc',
				itemId: id,
				freeTextId: descriptionId,
				text: description,
			})
		: undefined

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond.
	if (updateDescriptionText) {
		const { slug } = await prisma.organization.findUniqueOrThrow({
			where: { id: orgId },
			select: { slug: true },
		})
		const crowdin = await upsertSingleKey({
			isDatabaseString: true,
			key: updateDescriptionText.upsert.create.tsKey.create.key,
			text: updateDescriptionText.upsert.create.tsKey.create.text,
			context: buildContextUrl(slug, linkLocationId ?? undefined),
		})
		if (crowdin.id) {
			updateDescriptionText.upsert.create.tsKey.create.crowdinId = crowdin.id
		}
	}

	const result = await prisma.$transaction(async (tx) => {
		const updated = email
			? await tx.orgEmail.upsert({
					where: { id },
					create: {
						id,
						email,
						...record,
						description: updateDescriptionText ? { create: updateDescriptionText.upsert.create } : undefined,
						...(linkLocationId
							? {
									locations: {
										createMany: { data: [{ orgLocationId: linkLocationId }], skipDuplicates: true },
									},
								}
							: {
									organization: { createMany: { data: [{ organizationId: orgId }], skipDuplicates: true } },
								}),
					},
					update: {
						...record,
						description: updateDescriptionText,
						title: titleId ? { connect: { id: titleId } } : undefined,
					},
					select,
				})
			: await tx.orgEmail.update({
					where: { id },
					data: {
						...record,
						description: updateDescriptionText,
						title: titleId ? { connect: { id: titleId } } : undefined,
					},
					select,
				})
		return updated
	})

	const { description: updatedDescription, ...rest } = result

	const reformatted = {
		...rest,
		description: updatedDescription ? updatedDescription.tsKey.text : null,
	}

	return reformatted
}
export default update
