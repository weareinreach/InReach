import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'

export const getFilterOptions = async () => {
	try {
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
	} catch (error) {
		handleError(error)
	}
}
