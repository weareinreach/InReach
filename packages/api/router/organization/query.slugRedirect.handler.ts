import { prisma } from '@weareinreach/db'
import { readSlugRedirectCache, writeSlugRedirectCache } from '~api/cache/slugRedirect'
import { handleError } from '~api/lib/errorHandler'
import { isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSlugRedirectSchema } from './query.slugRedirect.schema'

const slugRedirect = async ({ input }: TRPCHandlerParams<TSlugRedirectSchema>) => {
	try {
		const cached = await readSlugRedirectCache(input)
		if (cached) {
			return { redirectTo: cached }
		}
		const { slug: primarySlug } =
			(await prisma.organization.findFirst({
				where: { OR: [{ slug: input }, { oldSlugs: { some: { from: input } } }], ...isPublic },
				select: { slug: true },
			})) ?? {}
		if (primarySlug && primarySlug !== input) {
			await writeSlugRedirectCache(input, primarySlug)
			return { redirectTo: primarySlug }
		}
		return { redirectTo: null }
	} catch (err) {
		return handleError(err)
	}
}
export default slugRedirect
