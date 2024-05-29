import { addSingleKey } from '@weareinreach/crowdin/api'
import { generateId, generateNestedFreeText, getAuditedClient } from '@weareinreach/db'
import { connectOneId } from '~api/schemas/nestedOps'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { data, orgId } = input
	const id = generateId('orgWebsite')
	const description = data.description
		? generateNestedFreeText({ orgId, itemId: id, text: data.description, type: 'websiteDesc' })
		: undefined

	const { url, isPrimary, published, organizationId, orgLocationId, orgLocationOnly } = data

	const result = await prisma.$transaction(async (tx) => {
		if (description) {
			const crowdin = await addSingleKey({
				isDatabaseString: true,
				key: description.create.tsKey.create.key,
				text: description.create.tsKey.create.text,
			})
			description.create.tsKey.create.crowdinId = crowdin.id
		}
		const newRecord = await tx.orgWebsite.create({
			data: {
				id,
				url,
				isPrimary,
				published,
				orgLocationOnly,
				description,
				organization: connectOneId(organizationId),
				locations: orgLocationId ? { create: { orgLocationId } } : undefined,
			},
			select: { id: true },
		})
		return newRecord
	})
	return result
}
export default create
