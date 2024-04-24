import { getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TLinkPhonesSchema } from './mutation.linkPhones.schema'

const linkPhones = async ({ ctx, input }: TRPCHandlerParams<TLinkPhonesSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)

	const links = await prisma.orgServicePhone.createMany({ data: input, skipDuplicates: true })
	return links
}
export default linkPhones
