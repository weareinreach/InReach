import { getAuditedClient, prisma as prismaRead } from '@weareinreach/db'
import { checkListOwnership } from '~api/lib/checkListOwnership'
import { nanoUrl } from '~api/lib/nanoIdUrl'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TShareUrlSchema } from './mutation.shareUrl.schema'

const generateUniqueSlug = async (): Promise<string> => {
	const slug = nanoUrl()
	const response = await prismaRead.userSavedList.findUnique({
		where: {
			sharedLinkKey: slug,
		},
	})
	if (response) {
		return generateUniqueSlug()
	}
	return slug
}
export const shareUrl = async ({ ctx, input }: TRPCHandlerParams<TShareUrlSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const urlSlug = await generateUniqueSlug()
	checkListOwnership({ listId: input.id, userId: ctx.session.user.id })

	const result = await prisma.userSavedList.update({
		where: input,
		data: { sharedLinkKey: urlSlug },
		select: {
			id: true,
			name: true,
			sharedLinkKey: true,
		},
	})
	return result
}
export default shareUrl
