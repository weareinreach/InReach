import { buildContextUrl, upsertSingleKey } from '@weareinreach/crowdin/api'
import { generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { id, orgId, description, countryId, phoneTypeId, ...rest } = input

	const textData = description
		? generateNestedFreeTextUpsert({ orgId, type: 'phoneDesc', text: description, itemId: id })
		: undefined

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond.
	if (textData) {
		const { slug } = await prisma.organization.findUniqueOrThrow({
			where: { id: orgId },
			select: { slug: true },
		})
		const crowdin = await upsertSingleKey({
			isDatabaseString: true,
			key: textData.upsert.create.tsKey.create.key,
			text: textData.upsert.create.tsKey.create.text,
			context: buildContextUrl(slug),
		})
		textData.upsert.create.tsKey.create.crowdinId = crowdin.id
	}

	const result = await prisma.$transaction(async (tx) => {
		const updatedRecord = await tx.orgPhone.update({
			where: { id },
			data: {
				...rest,
				...(textData ? { description: textData } : description === null && { description: { delete: true } }),
				...(countryId && { country: { connect: { id: countryId } } }),
				...(phoneTypeId && { phoneType: { connect: { id: phoneTypeId } } }),
			},
		})
		return updatedRecord
	})
	return result
}
export default update
