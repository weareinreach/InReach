import { addSingleKey, buildContextUrl } from '@weareinreach/crowdin/api'
import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { orgId, data } = input

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond.
	if (data.description) {
		const { slug } = await prisma.organization.findUniqueOrThrow({
			where: { id: orgId },
			select: { slug: true },
		})
		const crowdinId = await addSingleKey({
			isDatabaseString: true,
			key: data.description.create.tsKey.create.key,
			text: data.description.create.tsKey.create.text,
			context: buildContextUrl(slug),
		})
		data.description.create.tsKey.create.crowdinId = crowdinId.id
	}

	const result = await prisma.$transaction(async (tx) => {
		const newEmail = await tx.orgEmail.create({
			data,
			select: { id: true },
		})
		return newEmail
	})
	return result
}
export default create
