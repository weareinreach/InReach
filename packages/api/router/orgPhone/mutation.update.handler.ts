import { generateFreeText, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateSchema } from './mutation.update.schema'

export const update = async ({ ctx, input }: TRPCHandlerParams<TUpdateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { id, orgId, description, countryId, phoneTypeId, ...rest } = input

	const textData = description
		? generateFreeText({ orgId, type: 'phoneDesc', text: description, itemId: id })
		: undefined

	const updatedRecord = await prisma.orgPhone.update({
		where: { id },
		data: {
			...rest,
			...(textData
				? {
						description: {
							upsert: {
								create: {
									id: textData.freeText.id,
									tsKey: {
										connectOrCreate: {
											where: { ns_key: { ns: textData.translationKey.ns, key: textData.translationKey.key } },
											create: textData.translationKey,
										},
									},
								},
								update: { tsKey: { update: { text: textData.translationKey.text } } },
							},
						},
				  }
				: description === null
				  ? { description: { delete: true } }
				  : {}),
			...(countryId ? { country: { connect: { id: countryId } } } : {}),
			...(phoneTypeId ? { phoneType: { connect: { id: phoneTypeId } } } : {}),
		},
	})
	return updatedRecord
}
