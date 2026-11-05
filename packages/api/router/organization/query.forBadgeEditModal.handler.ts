import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { DATA_PORTAL_PERMISSIONS } from './lib/createOrgSuggestion'
import { type TForBadgeEditModalSchema } from './query.forBadgeEditModal.schema'

const forBadgeEditModal = async ({ input, ctx }: TRPCHandlerParams<TForBadgeEditModalSchema>) => {
	try {
		// Previously no visibility check at all - any org id's assigned badge list was fetchable by anyone.
		// Its one real caller (BadgeEdit, a staff editing modal) legitimately needs this for an org that's
		// still being set up and not yet published, so non-staff callers are filtered instead of everyone.
		const callerHasDataPortalAccess = Boolean(
			ctx.session?.user?.permissions.some((p) => DATA_PORTAL_PERMISSIONS.includes(p))
		)
		const data = await prisma.attributeSupplement.findMany({
			where: {
				organizationId: input.id,
				...(callerHasDataPortalAccess ? {} : { organization: { published: true, deleted: false } }),
				attribute: { categories: { some: { category: { tag: input.badgeType } } } },
			},
			select: {
				attributeId: true,
			},
		})
		return data.map(({ attributeId }) => attributeId)
	} catch (error) {
		return handleError(error)
	}
}
export default forBadgeEditModal
