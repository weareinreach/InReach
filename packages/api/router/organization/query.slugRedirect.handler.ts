import { prisma } from '@weareinreach/db'
import { readSlugRedirectCache, writeSlugRedirectCache } from '~api/cache/slugRedirect'
import { isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSlugRedirectSchema } from './query.slugRedirect.schema'

export const slugRedirect = async ({ input }: TRPCHandlerParams<TSlugRedirectSchema>) => {
	const cached = await readSlugRedirectCache(input)
	if (cached) {
		return { redirectTo: cached }
	}
	const { slug: primarySlug } = await prisma.organization.findFirstOrThrow({
		where: { OR: [{ slug: input }, { oldSlugs: { some: { from: input } } }], ...isPublic },
		select: { slug: true },
	})
	if (primarySlug !== input) {
		await writeSlugRedirectCache(input, primarySlug)
		return { redirectTo: primarySlug }
	}
	return { redirectTo: null }
}
