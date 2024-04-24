import { generateNestedFreeText, generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

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

	const updated = email
		? await prisma.orgEmail.upsert({
				where: { id },
				create: {
					id,
					email,
					...record,
					...(description && {
						description: generateNestedFreeText({
							orgId,
							type: 'emailDesc',
							itemId: id,
							freeTextId: descriptionId,
							text: description,
						}),
					}),
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
		: await prisma.orgEmail.update({
				where: { id },
				data: {
					...record,
					description: updateDescriptionText,
					title: titleId ? { connect: { id: titleId } } : undefined,
				},
				select,
			})
	const { description: updatedDescription, ...rest } = updated

	const reformatted = {
		...rest,
		description: updatedDescription ? updatedDescription.tsKey.text : null,
	}

	return reformatted
}
export default update
