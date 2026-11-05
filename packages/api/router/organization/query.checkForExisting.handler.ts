import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { DATA_PORTAL_PERMISSIONS } from './lib/createOrgSuggestion'
import { type TCheckForExistingSchema } from './query.checkForExisting.schema'

const checkForExisting = async ({ input, ctx }: TRPCHandlerParams<TCheckForExistingSchema>) => {
	// Previously no `deleted` filter at all, and no `published` filter for non-staff callers either, despite
	// returning `published` to the client - anonymous name-guessing revealed the existence, name, slug, and
	// publish-state of hidden/deleted orgs. Matches getPotentialMatches' existing pattern for the same reason.
	const callerHasDataPortalAccess = Boolean(
		ctx.session?.user?.permissions.some((p) => DATA_PORTAL_PERMISSIONS.includes(p))
	)
	const result = await prisma.organization.findFirst({
		where: {
			name: {
				contains: input,
				mode: 'insensitive',
			},
			...(callerHasDataPortalAccess ? {} : { published: true }),
			deleted: false,
		},
		select: {
			name: true,
			slug: true,
			published: true,
		},
	})
	return result
}
export default checkForExisting
