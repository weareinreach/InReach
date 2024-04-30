import { upsertSingleKey } from '@weareinreach/crowdin/api'
import { generateNestedFreeTextUpsert, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { id, orgId, description, countryId, phoneTypeId, ...rest } = input

	const textData = description
		? generateNestedFreeTextUpsert({ orgId, type: 'phoneDesc', text: description, itemId: id })
		: undefined

	const result = await prisma.$transaction(async (tx) => {
		if (textData) {
			const crowdin = await upsertSingleKey({
				isDatabaseString: true,
				key: textData.upsert.create.tsKey.create.key,
				text: textData.upsert.create.tsKey.create.text,
			})
			textData.upsert.create.tsKey.create.crowdinId = crowdin.id
		}
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
