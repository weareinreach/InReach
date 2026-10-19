import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { formatSavedList, savedListSelect } from './lib.savedListShape'
import { type TGetByUrlSchema } from './query.getByUrl.schema'

/**
 * Public and unauthenticated by design - anyone with the share link can view the list. Returns the same
 * renderable shape as the owner's `getById`, but only published organizations and services, and never
 * `ownedById` (it used to return the whole list row via `include`) (#2110).
 */
const getByUrl = async ({ input }: TRPCHandlerParams<TGetByUrlSchema>) => {
	try {
		const list = await prisma.userSavedList.findUniqueOrThrow({
			where: {
				sharedLinkKey: input.slug,
			},
			select: savedListSelect({ publicOnly: true }),
		})

		return formatSavedList(list)
	} catch (error) {
		return handleError(error)
	}
}
export default getByUrl
