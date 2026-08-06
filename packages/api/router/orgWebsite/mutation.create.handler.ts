import { addSingleKey, buildContextUrl } from '@weareinreach/crowdin/api'
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

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond.
	if (description) {
		const { slug } = await prisma.organization.findUniqueOrThrow({
			where: { id: orgId },
			select: { slug: true },
		})
		const crowdin = await addSingleKey({
			isDatabaseString: true,
			key: description.create.tsKey.create.key,
			text: description.create.tsKey.create.text,
			context: buildContextUrl(slug, orgLocationId),
		})
		description.create.tsKey.create.crowdinId = crowdin.id
	}

	const result = await prisma.$transaction(async (tx) => {
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
