import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNameByIdSchema } from './query.getNameById.schema'
import { DATA_PORTAL_PERMISSIONS } from '../organization/lib/createOrgSuggestion'

const getNameById = async ({ input, ctx }: TRPCHandlerParams<TGetNameByIdSchema>) => {
	// Previously no visibility check at all - a hidden/unpublished/deleted location's name was fetchable by
	// anyone who had its id.
	const callerHasDataPortalAccess = Boolean(
		ctx.session?.user?.permissions.some((p) => DATA_PORTAL_PERMISSIONS.includes(p))
	)
	const result = await prisma.orgLocation.findUniqueOrThrow({
		where: { id: input, ...(callerHasDataPortalAccess ? {} : { published: true, deleted: false }) },
		select: { name: true },
	})
	return result
}
export default getNameById
