import { TRPCError } from '@trpc/server'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetParentNameSchema } from './query.getParentName.schema'
import { DATA_PORTAL_PERMISSIONS } from '../organization/lib/createOrgSuggestion'

const getParentName = ({ input, ctx }: TRPCHandlerParams<TGetParentNameSchema>) => {
	const { slug, orgLocationId } = input
	// Previously no visibility check at all on either branch - a hidden/unpublished/deleted org or location's
	// name was fetchable by anyone who had its slug/id.
	const callerHasDataPortalAccess = Boolean(
		ctx.session?.user?.permissions.some((p) => DATA_PORTAL_PERMISSIONS.includes(p))
	)
	const visible = callerHasDataPortalAccess ? {} : { published: true, deleted: false }

	switch (true) {
		case Boolean(slug): {
			return prisma.organization.findUniqueOrThrow({
				where: { slug, ...visible },
				select: { name: true },
			})
		}
		case Boolean(orgLocationId): {
			return prisma.orgLocation.findUniqueOrThrow({
				where: { id: orgLocationId, ...visible },
				select: { name: true },
			})
		}
		default: {
			throw new TRPCError({ code: 'BAD_REQUEST' })
		}
	}
}
export default getParentName
