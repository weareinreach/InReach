import { upsertSingleKey } from '@weareinreach/crowdin/api'
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

	const result = await prisma.$transaction(async (tx) => {
		if (updateDescriptionText) {
			const crowdin = await upsertSingleKey({
				isDatabaseString: true,
				key: updateDescriptionText.upsert.create.tsKey.create.key,
				text: updateDescriptionText.upsert.create.tsKey.create.text,
			})
			if (crowdin.id) {
				updateDescriptionText.upsert.create.tsKey.create.crowdinId = crowdin.id
			}
		}
		const updated = email
			? await tx.orgEmail.upsert({
					where: { id },
					create: {
						id,
						email,
						...record,
						description: updateDescriptionText?.upsert,
						...(linkLocationId && {
							locations: { createMany: { data: [{ orgLocationId: linkLocationId }], skipDuplicates: true } },
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
