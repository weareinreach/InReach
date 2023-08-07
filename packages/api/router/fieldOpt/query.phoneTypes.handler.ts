import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'

export const phoneTypes = async () => {
	try {
		const result = await prisma.phoneType.findMany({
			where: { active: true },
			select: {
				id: true,
				tsKey: true,
				tsNs: true,
			},
			orderBy: { type: 'asc' },
		})
		return result
	} catch (error) {
		handleError(error)
	}
}
