import invariant from 'tiny-invariant'

import { addSingleKey } from '@weareinreach/crowdin/api'
import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const result = await prisma.$transaction(async (tx) => {
		if (input.description) {
			const crowdinDesc = await addSingleKey({
				isDatabaseString: true,
				key: input.description.create.tsKey.create.key,
				text: input.description.create.tsKey.create.text,
			})
			input.description.create.tsKey.create.crowdinId = crowdinDesc.id
		}
		if (input.phoneType?.create) {
			invariant(
				input.phoneType.create.key?.create && input.phoneType.create.key.create.namespace?.connect?.name
			)
			const crowdinPhoneType = await addSingleKey({
				isDatabaseString: false,
				key: input.phoneType.create.key.create.key,
				text: input.phoneType.create.key.create.text,
				ns: input.phoneType.create.key.create.namespace.connect.name as 'phone-type',
			})
			input.phoneType.create.key.create.crowdinId = crowdinPhoneType.id
		}

		const newPhone = await tx.orgPhone.create({
			data: input,
			select: { id: true },
		})
		return newPhone
	})
	return result
}
export default create
