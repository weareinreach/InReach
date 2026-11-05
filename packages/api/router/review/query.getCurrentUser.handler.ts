import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

const getCurrentUser = async ({ ctx }: TRPCHandlerParams<undefined, 'protected'>) => {
	const reviews = await prisma.orgReview.findMany({
		where: {
			userId: ctx.session.user.id,
			// A review always has an org, and optionally a specific location/service within it - whichever
			// applies must be published and not deleted, same as everywhere else this data is shown. Without
			// this, this endpoint returned the organization's full record (including fields like
			// unpublishedReason that aren't meant for a non-staff reviewer) regardless of its publish state.
			organization: { published: true, deleted: false },
			// orgLocationId/orgServiceId are optional - a review can be org-level only - so each needs its own
			// "absent, or published and not deleted" OR, combined via AND rather than two separate top-level
			// OR keys (a plain object can only hold one OR, a second would silently clobber the first).
			AND: [
				{ OR: [{ orgLocationId: null }, { orgLocation: { published: true, deleted: false } }] },
				{ OR: [{ orgServiceId: null }, { orgService: { published: true, deleted: false } }] },
			],
		},
		include: {
			organization: true,
			orgLocation: true,
			orgService: true,
		},
	})
	return reviews
}
export default getCurrentUser
