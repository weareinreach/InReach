import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { DATA_PORTAL_PERMISSIONS } from './lib/createOrgSuggestion'
import { type TGetNameFromSlugSchema } from './query.getNameFromSlug.schema'

const getNameFromSlug = async ({ input, ctx }: TRPCHandlerParams<TGetNameFromSlugSchema>) => {
	// Previously no visibility check at all - a hidden/unpublished/deleted org's name was fetchable by
	// anyone who had its slug.
	const callerHasDataPortalAccess = Boolean(
		ctx.session?.user?.permissions.some((p) => DATA_PORTAL_PERMISSIONS.includes(p))
	)
	const result = prisma.organization.findUniqueOrThrow({
		where: {
			slug: input,
			...(callerHasDataPortalAccess ? {} : { published: true, deleted: false }),
		},
		select: {
			name: true,
		},
	})
	return result
}
export default getNameFromSlug
