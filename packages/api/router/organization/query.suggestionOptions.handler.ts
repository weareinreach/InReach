import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'

export const suggestionOptions = async () => {
	try {
		const [countries, serviceTypes, communities] = await Promise.all([
			prisma.country.findMany({
				where: { activeForSuggest: true },
				select: { id: true, tsKey: true, tsNs: true },
				orderBy: { tsKey: 'desc' },
			}),
			prisma.serviceCategory.findMany({
				where: { active: true, activeForSuggest: true },
				select: { id: true, tsKey: true, tsNs: true },
				orderBy: { tsKey: 'asc' },
			}),
			prisma.attribute.findMany({
				where: {
					categories: { some: { category: { tag: 'service-focus' } } },
					parents: { none: {} },
					activeForSuggest: true,
				},
				select: {
					id: true,
					tsNs: true,
					tsKey: true,
					icon: true,
					children: {
						select: {
							child: { select: { id: true, tsNs: true, tsKey: true } },
						},
					},
				},
				orderBy: { tsKey: 'asc' },
			}),
		])

		return {
			countries,
			serviceTypes,
			communities: communities.map(({ children, ...record }) => {
				const newChildren = children.map(({ child }) => ({
					...child,
					parentId: record.id,
				}))
				return { ...record, children: newChildren }
			}),
		}
	} catch (error) {
		handleError(error)
	}
}
