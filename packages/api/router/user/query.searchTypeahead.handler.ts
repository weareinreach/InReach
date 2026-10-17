import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSearchTypeaheadSchema } from './query.searchTypeahead.schema'

/**
 * Lightweight name/email lookup backing the "Created By" type-ahead filters on the Organization, Review, and
 * Report data-portal tables - deliberately separate from the full `forUserTable` query (which returns
 * permissions/role data no filter dropdown needs) and capped at 10 results since it's a type-ahead, not a
 * listing.
 */
const searchTypeahead = async ({ input }: TRPCHandlerParams<TSearchTypeaheadSchema, 'protected'>) => {
	const search = input.search.trim()
	if (search.length < 2) {
		return []
	}
	return prisma.user.findMany({
		where: {
			OR: [
				{ name: { contains: search, mode: 'insensitive' } },
				{ email: { contains: search, mode: 'insensitive' } },
			],
		},
		select: { id: true, name: true, email: true },
		orderBy: { name: 'asc' },
		take: 10,
	})
}

export default searchTypeahead
