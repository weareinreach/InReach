import { prisma } from '@weareinreach/db'

export const getFilterOptions = async () => {
	const result = await prisma.serviceCategory.findMany({
		where: {
			active: true,
			OR: [{ crisisSupportOnly: null }, { crisisSupportOnly: false }],
		},
		select: {
			id: true,
			tsKey: true,
			tsNs: true,
			services: {
				where: {
					active: true,
				},
				select: {
					id: true,
					tsKey: true,
					tsNs: true,
				},
				orderBy: {
					name: 'asc',
				},
			},
		},
		orderBy: {
			category: 'asc',
		},
	})
	return result
}
