import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'

export const getOptions = async () => {
	try {
		const result = await prisma.serviceTag.findMany({
			select: {
				id: true,
				active: true,
				tsKey: true,
				tsNs: true,
				category: {
					select: {
						id: true,
						active: true,
						tsKey: true,
						tsNs: true,
					},
				},
			},
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
