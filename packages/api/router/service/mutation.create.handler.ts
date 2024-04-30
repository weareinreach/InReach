import { addSingleKey } from '@weareinreach/crowdin/api'
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

	const result = await prisma.$transaction(async (tx) => {
		if (serviceName) {
			const crowdin = await addSingleKey({
				isDatabaseString: true,
				key: serviceName.create.tsKey.create.key,
				text: serviceName.create.tsKey.create.text,
			})
			serviceName.create.tsKey.create.crowdinId = crowdin.id
		}
		if (description) {
			const crowdin = await addSingleKey({
				isDatabaseString: true,
				key: description.create.tsKey.create.key,
				text: description.create.tsKey.create.text,
			})
			description.create.tsKey.create.crowdinId = crowdin.id
		}
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
