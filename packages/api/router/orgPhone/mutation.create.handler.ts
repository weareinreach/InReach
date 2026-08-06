import invariant from 'tiny-invariant'

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
		const crowdinDesc = await addSingleKey({
			isDatabaseString: true,
			key: data.description.create.tsKey.create.key,
			text: data.description.create.tsKey.create.text,
			context: buildContextUrl(slug),
		})
		data.description.create.tsKey.create.crowdinId = crowdinDesc.id
	}
	if (data.phoneType?.create) {
		invariant(data.phoneType.create.key?.create)
		invariant(data.phoneType.create.key.create.namespace?.connect?.name)
		const crowdinPhoneType = await addSingleKey({
			isDatabaseString: false,
			key: data.phoneType.create.key.create.key,
			text: data.phoneType.create.key.create.text,
			ns: data.phoneType.create.key.create.namespace.connect.name as 'phone-type',
		})
		data.phoneType.create.key.create.crowdinId = crowdinPhoneType.id
	}

	const result = await prisma.$transaction(async (tx) => {
		const newPhone = await tx.orgPhone.create({
			data,
			select: { id: true },
		})
		return newPhone
	})
	return result
}
export default create
