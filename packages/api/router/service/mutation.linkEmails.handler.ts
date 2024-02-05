import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLinkEmailsSchema } from './mutation.linkEmails.schema'

export const linkEmails = async ({ ctx, input }: TRPCHandlerParams<TLinkEmailsSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const links = await prisma.orgServiceEmail.createMany({ data: input, skipDuplicates: true })
	return links
}
export default linkEmails
