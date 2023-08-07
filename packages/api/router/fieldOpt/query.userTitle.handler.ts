import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'

export const userTitle = async () => {
	try {
		const results = await prisma.userTitle.findMany({
			where: { searchable: true },
			select: { id: true, title: true },
		})
		return results
	} catch (error) {
		handleError(error)
	}
}
