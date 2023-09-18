import { prisma } from '@weareinreach/db'

export const getFilterOptions = async () => {
	const result = await prisma.attribute.findMany({
		where: {
			AND: {
				filterType: {
					not: null,
				},
				active: true,
			},
		},
		select: {
			id: true,
			tsKey: true,
			tsNs: true,
			filterType: true,
		},
		orderBy: {
			tsKey: 'asc',
		},
	})

	return result
}
