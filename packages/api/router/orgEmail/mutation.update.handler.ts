import { generateNestedFreeTextUpsert, prisma, setAuditId } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

export const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const { id, orgId, description, descriptionId, titleId, ...record } = input

	const updatedDescription = description
		? generateNestedFreeTextUpsert({
				orgId,
				type: 'emailDesc',
				itemId: id,
				freeTextId: descriptionId,
				text: description,
			})
		: undefined

	const updatedRecord = await prisma.$transaction(async (tx) => {
		await setAuditId(ctx.actorId, tx)

		const updated = await tx.orgEmail.update({
			where: { id },
			data: {
				...record,
				description: updatedDescription,
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
		const { description, ...rest } = updated

		const reformatted = {
			...rest,
			description: description ? description.tsKey.text : null,
		}

		return reformatted
	})
	return updatedRecord
}
