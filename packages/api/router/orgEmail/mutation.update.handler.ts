import { generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

export const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { id, orgId, description, descriptionId, titleId, ...record } = input

	const updateDescriptionText = description
		? generateNestedFreeTextUpsert({
				orgId,
				type: 'emailDesc',
				itemId: id,
				freeTextId: descriptionId,
				text: description,
			})
		: undefined

	const updated = await prisma.orgEmail.update({
		where: { id },
		data: {
			...record,
			description: updateDescriptionText,
			title: titleId ? { connect: { id: titleId } } : undefined,
		},
		select: {
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
		},
	})
	const { description: updatedDescription, ...rest } = updated

	const reformatted = {
		...rest,
		description: updatedDescription ? updatedDescription.tsKey.text : null,
	}

	return reformatted
}
export default update
