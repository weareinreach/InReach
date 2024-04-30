import { addSingleKey } from '@weareinreach/crowdin/api'
import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const result = await prisma.$transaction(async (tx) => {
		if (input.description) {
			const crowdinId = await addSingleKey({
				isDatabaseString: true,
				key: input.description.create.tsKey.create.key,
				text: input.description.create.tsKey.create.text,
			})
			input.description.create.tsKey.create.crowdinId = crowdinId.id
		}
		const newEmail = await tx.orgEmail.create({
			data: input,
			select: { id: true },
		})
		return newEmail
	})
	return result
}
export default create
