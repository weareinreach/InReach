import { prisma } from '@weareinreach/db'

/**
 * Fetches the master list of community focus attributes for search filtering and prioritization.
 */
const getCommunityFocusOptions = async () => {
	const communities = await prisma.attribute.findMany({
		where: {
			categories: { some: { category: { tag: 'service-focus' } } },
			parents: { none: {} },
			active: true,
		},
		select: {
			id: true,
			tag: true,
			tsNs: true,
			tsKey: true,
			icon: true,
		},
		orderBy: { tsKey: 'asc' },
	})

	return communities
}
export default getCommunityFocusOptions
