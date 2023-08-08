import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { nanoUrl } from '~api/lib/nanoIdUrl'
import { CreateAuditLog } from '~api/schemas/create/auditLog'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TShareUrlSchema } from './mutation.shareUrl.schema'

const generateUniqueSlug = async (): Promise<string> => {
	const slug = nanoUrl()
	const response = await prisma.userSavedList.findUnique({
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
	try {
		const urlSlug = await generateUniqueSlug()
		const from = { sharedLinkKey: null }

		const data = { sharedLinkKey: urlSlug }
		const result = await prisma.userSavedList.update({
			where: input,
			data: {
				...data,
				auditLogs: CreateAuditLog({ actorId: ctx.session.user.id, operation: 'UPDATE', from, to: data }),
			},
			select: {
				id: true,
				name: true,
				sharedLinkKey: true,
			},
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
