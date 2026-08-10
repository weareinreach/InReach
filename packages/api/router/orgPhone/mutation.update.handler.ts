import { buildContextUrl, syncDatabaseStringIfChanged } from '@weareinreach/crowdin/api'
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
		const existing = await prisma.orgPhone.findUnique({
			where: { id },
			select: { description: { select: { tsKey: { select: { text: true, crowdinId: true } } } } },
		})
		const crowdinId = await syncDatabaseStringIfChanged({
			key: textData.upsert.create.tsKey.create.key,
			newText: textData.upsert.create.tsKey.create.text,
			previousText: existing?.description?.tsKey.text,
			previousCrowdinId: existing?.description?.tsKey.crowdinId,
			context: buildContextUrl(slug),
		})
		if (crowdinId) {
			textData.upsert.create.tsKey.create.crowdinId = crowdinId
		}
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
