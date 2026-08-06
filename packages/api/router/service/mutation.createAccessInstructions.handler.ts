import { addSingleKey, buildContextUrl } from '@weareinreach/crowdin/api'
import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateAccessInstructionsSchema } from './mutation.createAccessInstructions.schema'

const createAccessInstructions = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateAccessInstructionsSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const { orgId, attributeSupplement, freeText, translationKey } = input

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond.
	if (translationKey) {
		const org = await prisma.organization.findUniqueOrThrow({ where: { id: orgId }, select: { slug: true } })
		const crowdin = await addSingleKey({
			isDatabaseString: true,
			key: translationKey.data.key,
			text: translationKey.data.text,
			context: buildContextUrl(org.slug),
		})
		translationKey.data.crowdinId = crowdin.id
	}

	const result = await prisma.$transaction(async (tx) => {
		const tKey = translationKey ? await tx.translationKey.create(translationKey) : undefined
		const fText = freeText ? await tx.freeText.create(freeText) : undefined
		const aSupp = attributeSupplement ? await tx.attributeSupplement.create(attributeSupplement) : undefined
		return {
			translationKey: tKey,
			freeText: fText,
			attributeSupplement: aSupp,
		}
	})
	return result
}
export default createAccessInstructions
