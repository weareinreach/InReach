import { addSingleKey, buildContextUrl } from '@weareinreach/crowdin/api'
import { generateId, generateNestedFreeText, getAuditedClient } from '@weareinreach/db'
import { connectOneId } from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { orgId, data } = input
	const id = generateId('orgService')
	const serviceName = generateNestedFreeText({
		orgId,
		text: data.serviceName,
		type: 'svcName',
		itemId: id,
	})
	const description = data.description
		? generateNestedFreeText({ orgId, text: data.description, type: 'svcDesc', itemId: id })
		: undefined
	const organization = connectOneId(data.organizationId)
	const { published } = data

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond.
	const { slug } = await prisma.organization.findUniqueOrThrow({
		where: { id: orgId },
		select: { slug: true },
	})
	if (serviceName) {
		const crowdin = await addSingleKey({
			isDatabaseString: true,
			key: serviceName.create.tsKey.create.key,
			text: serviceName.create.tsKey.create.text,
			context: buildContextUrl(slug),
		})
		serviceName.create.tsKey.create.crowdinId = crowdin.id
	}
	if (description) {
		const crowdin = await addSingleKey({
			isDatabaseString: true,
			key: description.create.tsKey.create.key,
			text: description.create.tsKey.create.text,
			context: buildContextUrl(slug),
		})
		description.create.tsKey.create.crowdinId = crowdin.id
	}

	const result = await prisma.$transaction(async (tx) => {
		const createData = {
			id,
			serviceName,
			description,
			organization,
			published,
		}

		const newService = await tx.orgService.create({ data: createData })
		return newService
	})
	return result
}
export default create
